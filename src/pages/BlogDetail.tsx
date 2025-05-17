// src/components/BlogDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaCalendarAlt, FaUser, FaFolder, FaClock, FaFacebook, FaTwitter, FaPinterest, FaLinkedin } from 'react-icons/fa';

AOS.init({ duration: 800, once: true });

interface Blog {
  _id: string;
  title: string;
  content: string;
  image: string;    
  author: string;
  category: string;
  createdAt: string;
}

interface RelatedBlog {
  _id: string;
  title: string;
  image: string;
  category: string;
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([]);
  const [loading, setLoading] = useState(true);

  // Xác định API_URL phù hợp Vite hoặc CRA
  const API_URL: string = (() => {
    // Vite
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    // CRA
    if (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    // fallback
    return 'http://localhost:5000';
  })();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${API_URL}/api/blogs/${id}`);
        if (!res.ok) throw new Error(`Lỗi ${res.status}`);
        const data: Blog = await res.json();
        setBlog(data);
        
        // Fetch related blogs
        const relatedRes = await fetch(`${API_URL}/api/blogs?category=${data.category}&limit=3&exclude=${id}`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          setRelatedBlogs(relatedData.blogs || []);
        }
      } catch (err) {
        console.error('Lỗi khi lấy bài viết:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlog();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [API_URL, id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Estimate reading time (assuming 200 words per minute)
  const calculateReadingTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="w-full h-96 bg-gray-200 rounded-xl" />
            <div className="h-10 bg-gray-200 rounded-lg w-3/4" />
            <div className="flex gap-4">
              <div className="h-6 bg-gray-200 rounded w-24" />
              <div className="h-6 bg-gray-200 rounded w-32" />
            </div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-lg mx-auto bg-white rounded-xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Bài viết không tồn tại</h1>
          <p className="text-gray-600 mb-6">Bài viết bạn đang tìm kiếm có thể đã bị xóa hoặc di chuyển.</p>
          <Link to="/blog" className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
            Quay lại danh sách bài viết
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero section with blog image */}
      <div className="relative w-full h-96 md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
          src={`${API_URL}${blog.image}`}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="container px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg"
            >
              {blog.title}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4 text-white/90 text-sm"
            >
              <span className="flex items-center gap-1">
                <FaCalendarAlt /> {formatDate(blog.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <FaUser /> {blog.author}
              </span>
              <span className="flex items-center gap-1">
                <FaFolder /> {blog.category}
              </span>
              <span className="flex items-center gap-1">
                <FaClock /> {calculateReadingTime(blog.content)} phút đọc
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-30">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="lg:w-2/3"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-10">
              {/* Share buttons */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">Chia sẻ:</span>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <FaFacebook />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors">
                      <FaTwitter />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors">
                      <FaPinterest />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center hover:bg-blue-900 transition-colors">
                      <FaLinkedin />
                    </button>
                  </div>
                </div>
                <Link to="/blog" className="text-sm text-pink-600 hover:text-pink-800 transition-colors flex items-center gap-1">
                  ← Quay lại
                </Link>
              </div>

              {/* Content */}
              <div 
                className="prose max-w-none text-gray-700 leading-relaxed"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                {blog.content.split('\n').map((para, idx) => (
                  <p key={idx} className="mb-6 text-lg">
                    {para}
                  </p>
                ))}
              </div>

              {/* Tags */}
              <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
                <span className="text-gray-600">Tags:</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-pink-100 cursor-pointer transition-colors">
                  {blog.category}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-pink-100 cursor-pointer transition-colors">
                  Hoa tươi
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-pink-100 cursor-pointer transition-colors">
                  Quà tặng
                </span>
              </div>

              {/* Author */}
              <div className="mt-10 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src={`${API_URL}/images/authors/default.jpg`} 
                      alt={blog.author}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{blog.author}</h3>
                    <p className="text-gray-600 text-sm">Tác giả</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="lg:w-1/3"
          >
            {/* Related posts */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Bài viết liên quan
              </h3>
              {relatedBlogs.length > 0 ? (
                <div className="space-y-4">
                  {relatedBlogs.map(related => (
                    <Link 
                      key={related._id} 
                      to={`/blog/${related._id}`}
                      className="flex gap-3 group"
                    >
                      <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={`${API_URL}${related.image}`}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors line-clamp-2">
                          {related.title}
                        </h4>
                        <span className="text-sm text-gray-500">{related.category}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Không có bài viết liên quan.</p>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Danh mục
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/blog?category=hoa-tuoi" className="flex items-center justify-between text-gray-700 hover:text-pink-600 transition-colors">
                    <span>Hoa tươi</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">12</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog?category=qua-tang" className="flex items-center justify-between text-gray-700 hover:text-pink-600 transition-colors">
                    <span>Quà tặng</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">8</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog?category=trang-tri" className="flex items-center justify-between text-gray-700 hover:text-pink-600 transition-colors">
                    <span>Trang trí</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">5</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog?category=su-kien" className="flex items-center justify-between text-gray-700 hover:text-pink-600 transition-colors">
                    <span>Sự kiện</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">7</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-r from-pink-500 to-pink-700 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Đăng ký nhận tin</h3>
              <p className="text-white/90 mb-4 text-sm">Nhận thông tin mới nhất về sản phẩm và ưu đãi đặc biệt.</p>
              
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full px-4 py-2 rounded-lg text-gray-800 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-white text-pink-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}