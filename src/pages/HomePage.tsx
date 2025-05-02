import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import confetti from "canvas-confetti";
import { useInView } from "react-intersection-observer";

// Initialize AOS
AOS.init({ duration: 800, once: true });

interface Banner {
  _id: string;
  image: string;
  title?: string;
  description?: string;
  link?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  image?: string;
}

const ProductCard = memo(({ product, addToCart, handleFavoriteToggle, isInFavorites }: {
  product: Product;
  addToCart: (product: Product) => void;
  handleFavoriteToggle: (product: Product) => void;
  isInFavorites: (id: string) => boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative p-3 hover:shadow-lg transition-shadow"
      whileHover={{ scale: 1.03 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      data-aos="fade-up"
    >
      <div className="relative w-full h-40 mb-3 overflow-hidden rounded-lg">
        <motion.img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        {product.discount && (
          <motion.span
            className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {product.discount}
          </motion.span>
        )}
        <motion.button
          className={`absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
            isInFavorites(product._id) ? "bg-pink-500 text-white" : "bg-white text-pink-500 border border-pink-300"
          }`}
          onClick={(e) => {
            e.preventDefault();
            handleFavoriteToggle(product);
          }}
          whileTap={{ scale: 0.8 }}
          aria-label={isInFavorites(product._id) ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill={isInFavorites(product._id) ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </motion.button>
      </div>
      <div className="flex flex-col justify-between flex-1">
        <h3 className="text-sm font-medium line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-pink-600 font-bold text-sm">{product.price.toLocaleString()}₫</span>
            {product.originalPrice && (
              <div className="flex items-center mt-1">
                <span className="text-gray-400 line-through text-xs">{product.originalPrice.toLocaleString()}₫</span>
              </div>
            )}
          </div>
          <motion.button
            className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-pink-600 transition-colors"
            onClick={() => addToCart(product)}
            whileTap={{ scale: 0.8 }}
            aria-label="Thêm vào giỏ hàng"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </motion.button>
        </div>
        <div className="text-orange-500 text-xs flex items-center gap-1 mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Gói quà miễn phí
        </div>
      </div>
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Link
            to={`/detail/${product._id}`}
            className="bg-white text-pink-600 rounded-full px-4 py-2 text-sm font-medium hover:bg-pink-100 transition"
          >
            Xem chi tiết
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
});

export default function HomePage() {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<string[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [activeSlide, setActiveSlide] = useState(0);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [showEffect, setShowEffect] = useState(false);

  // Lazy loading refs
  const { ref: newProductsRef, inView: newProductsInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: hotDealsRef, inView: hotDealsInView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        const categoryNames = res.data.map((cat: any) => cat.name);
        setCategories(categoryNames);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };

    const fetchNewProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/new");
        console.log("Sản phẩm mới từ API:", res.data);
        setNewProducts(res.data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm mới:", error);
      }
    };

    const fetchBanners = async () => {
      try {
        const res = await axios.get<Banner[]>("http://localhost:5000/api/banners");
        console.log("📸 Banners:", res.data);
        setBanners(res.data);
      } catch (error) {
        console.error("Lỗi khi tải banners:", error);
      }
    };

    fetchBanners();
    fetchCategories();
    fetchNewProducts();
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);


  useEffect(() => {
    const interval = setInterval(() => {
      setShowEffect(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFavoriteToggle = useCallback(
    (product: {
      _id: string;
      name: string;
      price: number;
      originalPrice?: number;
      discount?: string;
      image?: string;
    }) => {
      if (isInFavorites(product._id)) {
        removeFromFavorites(product._id);
      } else {
        addToFavorites({
          _id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          image: product.image || "/placeholder.png",
        });
      }
    },
    [addToFavorites, removeFromFavorites, isInFavorites]
  );

  const carouselImages = useMemo(
    () => [
      {
        _id: "1",
        title: "Black Friday Day",
        subtitle: "Giảm giá 50%",
        image: "/assets/images/black-friday-sale.jpg",
        thumbnail: "/assets/images/black-friday-sale.jpg",
      },
      {
        _id: "2",
        title: "Ưu đãi Valentine Day",
        subtitle: "Ưu đãi đặc biệt",
        image: "/assets/images/valentine.jpg",
        thumbnail: "/assets/images/valentine.jpg",
      },
      {
        _id: "3",
        title: "Bộ Sưu Tập Mới",
        subtitle: "Khám phá ngay",
        image: "/assets/images/stock.jpg",
        thumbnail: "/assets/images/stock.jpg",
      },
    ],
    []
  );

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState(5 * 24 * 60 * 60);

    React.useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    const formatTime = useMemo(
      () => (seconds: number) => {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const secs = seconds % 60;
        return { days, hours, minutes, secs };
      },
      []
    );

    const { days, hours, minutes, secs } = formatTime(timeLeft);

    return (
      <motion.div
        className="flex gap-2"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {[
          { value: days, label: "Ngày" },
          { value: hours, label: "Giờ" },
          { value: minutes, label: "Phút" },
          { value: secs, label: "Giây" },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className="bg-white rounded-lg p-3 text-center min-w-[50px] shadow-sm"
            animate={{ rotateX: 360 }}
            transition={{ duration: 0.5, delay: item.value !== item.value ? 0.1 * idx : 0 }}
          >
            <div className="text-pink-600 font-bold text-lg">{item.value.toString().padStart(2, "0")}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const handleChatClick = () => {
    // Placeholder for chat functionality
    alert("Mở khung chat với shop!");
  };

  return (
    <>
      <div className="max-w-7xl mx-auto flex flex-col px-6 py-6 gap-6 bg-white-50">
        {/* Combined box with categories, carousel, and promotions */}
        <div className="flex gap-4">
          {/* Left Sidebar - Categories */}
          <aside className="w-64 flex-shrink-0 bg-white rounded shadow-sm flex flex-col justify-start" data-aos="fade-right">
            <div className="font-bold p-3 text-gray-700 border-b flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Danh mục sản phẩm
            </div>
            <ul className="flex-1 flex flex-col text-sm max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent hover:scrollbar-thumb-pink-500">
              {categories.map((cat, i) => (
                <motion.li
                  key={i}
                  className="hover:bg-pink-50 transition px-3 py-2 cursor-pointer border-b flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-pink-500">•</span> {cat}
                </motion.li>
              ))}
            </ul>
          </aside>

          {/* Main content with carousel and thumbnails */}
          <div className="flex-1">
            {/* Banner carousel */}
            <div className="w-full h-80 bg-pink-100 rounded-lg relative overflow-hidden mb-4" data-aos="zoom-in">
              <AnimatePresence initial={false}>
                {banners.map(
                  (banner, index) =>
                    index === activeSlide && (
                      <motion.div
                        key={banner._id}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.img
                          src={banner.image}
                          alt={banner.title || `Banner ${index + 1}`}
                          className="w-full h-full object-cover"
                          animate={{ scale: 1.1 }}
                          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center text-white"
                          >
                            <h2 className="text-2xl font-bold mb-2">{banner.title}</h2>
                            <p className="text-sm">{banner.description}</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    )
                )}
              </AnimatePresence>
              <motion.button
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-pink-200 rounded-full p-2 shadow transition"
                onClick={() => setActiveSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                whileHover={{ scale: 1.1 }}
                aria-label="Previous slide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              <motion.button
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-pink-200 rounded-full p-2 shadow transition"
                onClick={() => setActiveSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                whileHover={{ scale: 1.1 }}
                aria-label="Next slide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
            {/* Thumbnail navigation - Moved to separate section below banner */}
            <div className="w-full bg-gray-100 p-2 rounded-lg flex justify-center gap-2">
              {banners.map((banner, index) => (
                <motion.button
                  key={banner._id}
                  className={`w-24 h-16 rounded overflow-hidden border-2 ${
                    index === activeSlide ? "border-pink-500" : "border-transparent"
                  } flex-shrink-0`}
                  onClick={() => setActiveSlide(index)}
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src={banner.image}
                    alt={banner.title || `Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right sidebar for "Quà mới về" */}
          <aside className="w-72 flex-shrink-0 bg-white rounded shadow-sm p-3 justify-start" ref={newProductsRef}>
            <h3 className="font-bold text-pink-600 mb-3" data-aos="fade-left">Quà mới về!</h3>
            {newProductsInView ? (
              newProducts.length === 0 ? (
                <p className="text-sm text-gray-500">Hiện chưa có sản phẩm mới.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {newProducts.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link
                        to={`/detail/${item._id}`}
                        className={`flex gap-2 pb-3 border-b hover:bg-pink-50 transition p-2 rounded ${
                          index === 0 ? "bg-gradient-to-r from-pink-200 to-purple-200" : ""
                        }`}
                      >
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="text-xs font-medium line-clamp-2">{item.name}</div>
                          <div className="text-pink-600 font-bold text-sm mt-1">{item.price.toLocaleString()}₫</div>
                          {index === 0 && (
                            <span className="absolute top-2 left-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full">
                              Mới nhất
                            </span>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-2 p-2 animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        {/* Promotions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4" data-aos="fade-up">
          {["LOFI10", "LOFI15", "LOFI99K", "FREESHIP"].map((code) => (
            <motion.div
              key={code}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg p-3 flex flex-col items-center relative shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
            >
              <div className="absolute right-2 top-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <span className="font-bold">Nhập mã: {code}</span>
              <span className="text-xs text-center my-1">
                {code === "LOFI10" && "Mã giảm 10% cho đơn hàng từ 500k trở lên."}
                {code === "LOFI15" && "Mã giảm 15% cho đơn hàng từ 1 triệu trở lên."}
                {code === "LOFI99K" && "Mã giảm 99k cho đơn hàng từ 700k trở lên."}
                {code === "FREESHIP" && "Miễn phí vận chuyển cho đơn hàng từ 500k."}
              </span>
              <motion.button
                className="mt-1 bg-white text-purple-500 font-semibold rounded px-3 py-0.5 text-xs"
                onClick={() => handleCopyCode(code)}
                whileTap={{ scale: 0.9 }}
                animate={copied === code ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {copied === code ? "ĐÃ SAO CHÉP" : "SAO CHÉP MÃ"}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Hot deals section */}
        <div className="mt-6" ref={hotDealsRef}>
          <div className="flex items-center gap-2 mb-4" data-aos="fade-right">
            <h3 className="font-bold text-pink-600 flex items-center gap-1">
              <span className="bg-pink-500 text-white rounded-full px-2 py-0.5 text-xs">HOT</span>
              Ưu đãi hot! Đừng bỏ lỡ
            </h3>
          </div>
          {hotDealsInView ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 auto-rows-min">
              {[
                { _id: "1", name: "Bộ quà tặng Luvgift Sweet things", price: 210000, originalPrice: 350000, discount: "-40%", height: "h-64" },
                { _id: "2", name: "Set quà trí ẩn cô giáo", price: 500000, originalPrice: 550000, discount: "-10%", height: "h-72" },
                { _id: "3", name: "Set quà truyền động lực", price: 190000, originalPrice: 250000, discount: "-24%", height: "h-60" },
                { _id: "4", name: "Set quà tặng sinh nhật GS1028", price: 165000, originalPrice: 195000, discount: "-15%", height: "h-68" },
                { _id: "5", name: "Set quà tặng phụ nữ GS1041", price: 356000, originalPrice: 460000, discount: "-22%", height: "h-64" },
              ].map((product) => (
                <div key={product._id} className={product.height}>
                  <ProductCard
                    product={product}
                    addToCart={(product) => addToCart({ ...product, image: product.image || "/placeholder.png" })}
                    handleFavoriteToggle={handleFavoriteToggle}
                    isInFavorites={isInFavorites}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-3 animate-pulse">
                  <div className="w-full h-40 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best sellers section */}
        <div className="mt-6">
          <h3 className="font-bold text-pink-600 mb-3 flex items-center gap-1" data-aos="fade-right">
            <span>🎁</span> Quà tặng đặt nhiều nhất trong tháng
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div
              className="bg-white rounded-lg overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              data-aos="fade-up"
            >
              <img
                src="/path-to-your-sale-image.jpg"
                alt="Giảm giá 50%"
                className="w-full h-full object-cover rounded-lg"
              />
            </motion.div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { _id: "1", name: "Bộ quà tặng Luvgift Sweet things", price: 210000, originalPrice: 350000, discount: "-40%", image: "" },
                { _id: "2", name: "Bộ chăm sóc da mặt cây lăn đá thạch anh chống lão hóa", price: 165000, originalPrice: undefined, discount: "", image: "" },
                { _id: "3", name: "Set quà tặng bạn gái hoa sáp kèm tinh dầu", price: 210000, originalPrice: undefined, discount: "", image: "" },
                { _id: "4", name: "Set 4 món bước tóc, bịt mắt, băng đô vải lụa cao cấp", price: 130000, originalPrice: undefined, discount: "", image: "" },
                { _id: "5", name: "Bộ quà tặng nến sáp thơm khu rừng tre Panda", price: 395000, originalPrice: undefined, discount: "", image: "" },
                { _id: "6", name: "Đèn ngủ silicon đá màu Thỏ Mập dễ thương", price: 360000, originalPrice: undefined, discount: "", image: "" },
              ].map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  addToCart={(product) => addToCart({ ...product, image: product.image || "/placeholder.png" })}
                  handleFavoriteToggle={handleFavoriteToggle}
                  isInFavorites={isInFavorites}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <motion.button
              className="bg-pink-500 text-white rounded-full px-6 py-2 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Xem tất cả
            </motion.button>
          </div>
        </div>

        {/* Special offers section */}
        <div className="mt-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-700 rounded-lg p-4" data-aos="fade-up">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="text-white text-2xl">🎁</div>
                <h3 className="font-bold text-white text-xl">ƯU ĐÃI ĐỘC QUYỀN GIẢM CHẤT ĐẾN 50%</h3>
              </div>
              <div className="text-xs text-white mt-2 md:mt-0">
                Sản phẩm sale đến khi hết hàng. Tiết kiệm đến 50%, đừng bỏ lỡ bạn ơi...
              </div>
              <CountdownTimer />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { _id: "1", name: "Bộ quà tặng Luvgift Sweet things", price: 210000, originalPrice: 350000, discount: "-40%" },
                { _id: "2", name: "Set quà trí ẩn cô giáo tặng cậu em", price: 500000, originalPrice: 550000, discount: "-10%" },
                { _id: "3", name: "Set quà truyền động lực", price: 190000, originalPrice: 250000, discount: "-24%" },
                { _id: "4", name: "Set quà tặng sinh nhật GS1028", price: 165000, originalPrice: 195000, discount: "-15%" },
                { _id: "5", name: "Set quà tặng phụ nữ GS1041", price: 356000, originalPrice: 460000, discount: "-22%" },
              ].map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  addToCart={(product) => addToCart({ ...product, image: product.image || "/placeholder.png" })}
                  handleFavoriteToggle={handleFavoriteToggle}
                  isInFavorites={isInFavorites}
                />
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <motion.button
                className="bg-white text-pink-600 rounded-full px-6 py-1 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Xem tất cả
              </motion.button>
            </div>
          </div>
        </div>

        {/* Gift categories sections */}
        {["Đuổi Đêm Đón Đỏ >>> Rước Ngay Mèo Thần Tài", "Quà Tặng Sinh Nhật Ý Nghĩa"].map((title, idx) => (
          <div key={idx} className="mt-6">
            <h3 className="font-bold text-pink-600 mb-3 flex items-center gap-1" data-aos="fade-right">
              <span>🎁</span> {title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { _id: "1", name: "Bộ quà tặng Luvgift Sweet things", price: 210000, originalPrice: 350000, discount: "-40%" },
                { _id: "2", name: "Set quà trí ẩn cô giáo tặng cậu em", price: 500000, originalPrice: 550000, discount: "-10%" },
                { _id: "3", name: "Set quà truyền động lực", price: 190000, originalPrice: 250000, discount: "-24%" },
                { _id: "4", name: "Set quà tặng sinh nhật GS1028", price: 165000, originalPrice: 195000, discount: "-15%" },
                { _id: "5", name: "Set quà tặng phụ nữ GS1041", price: 356000, originalPrice: 460000, discount: "-22%" },
              ].map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  addToCart={(product) => addToCart({ ...product, image: product.image || "/placeholder.png" })}
                  handleFavoriteToggle={handleFavoriteToggle}
                  isInFavorites={isInFavorites}
                />
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <motion.button
                className="bg-white text-pink-600 rounded-full px-6 py-1 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Xem tất cả
              </motion.button>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Icon and Effect */}
      <div className="fixed bottom-5 right-5 z-50">
        <motion.button
          className="bg-pink-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-pink-600 transition"
          onClick={handleChatClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Chat với shop"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </motion.button>
        
        {/* Circular animation effect collapsing precisely into chat icon */}
        {showEffect && (
          <motion.div
            className="fixed rounded-full bg-gradient-to-r from-pink-300 to-purple-400 z-40"
            initial={{ 
              width: "100vw",
              height: "100vw",
              top: "50%",
              left: "50%",
              x: "-50%", 
              y: "-50%",
              opacity: 0.4
            }}
            animate={{
              width: "56px",
              height: "56px",
              top: "calc(100% - 20px - 28px)",
              left: "calc(100% - 20px - 28px)",
              x: 0,
              y: 0,
              opacity: 0
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut" 
            }}
            onAnimationComplete={() => setShowEffect(false)}
          />
        )}
        
        {/* Subtle permanent pulse animation */}
        <motion.div 
          className="absolute -inset-2 rounded-full bg-pink-400 opacity-30"
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut" 
          }}
        />
      </div>
    </>
  );
}