// src/components/BlogList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import 'aos/dist/aos.css';
import { FiClock, FiUser, FiTag, FiChevronRight, FiSearch } from 'react-icons/fi';

interface Blog {
  _id: string;
  title: string;
  content: string;
  image: string;
  author: string;
  category: string;
  createdAt: string;
}

export default function BlogList() {
  // Lấy URL backend một cách an toàn với cả Vite và CRA
  const API_URL: string = (() => {
    // VITE (import.meta.env)
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    // CRA (process.env)
    if (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    // fallback
    return 'http://localhost:5000';
  })();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null);

  // Danh sách các danh mục phổ biến
  const categories = ['Tất cả', 'Quà tặng', 'Hoa', 'Dịp lễ', 'Sinh nhật', 'Tình yêu'];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/blogs`);
        if (!res.ok) {
          throw new Error(`Lỗi khi lấy dữ liệu: ${res.status} ${res.statusText}`);
        }
        const data: Blog[] = await res.json();
        setBlogs(data);
        setFilteredBlogs(data);
        
        // Chọn bài viết mới nhất làm bài viết nổi bật
        if (data.length > 0) {
          const sorted = [...data].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setFeaturedBlog(sorted[0]);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Đã xảy ra lỗi khi tải danh sách bài viết.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [API_URL]);

  // Lọc blog theo danh mục và tìm kiếm
  useEffect(() => {
    let result = [...blogs];

    // Lọc theo danh mục
    if (activeCategory !== 'Tất cả') {
      result = result.filter(blog => 
        blog.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm.trim() !== '') {
      result = result.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBlogs(result);
  }, [activeCategory, searchTerm, blogs]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero skeleton */}
          <div className="bg-gray-100 rounded-2xl p-6 animate-pulse mb-8">
            <div className="h-64 bg-gray-200 rounded-xl mb-4" />
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-3" />
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
          
          {/* Category skeletons */}
          <div className="flex overflow-x-auto space-x-4 mb-8 pb-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            ))}
          </div>
          
          {/* Blog card skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{error}</h1>
          <p className="text-gray-600 mb-6">Xin lỗi, chúng tôi không thể tải dữ liệu blog. Vui lòng thử lại sau.</p>
          <Link 
            to="/" 
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full inline-block hover:opacity-90 transition-opacity"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Blog Quà Tặng & Ý Tưởng
          </motion.h1>
          
          <motion.p 
            className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Khám phá ý tưởng quà tặng độc đáo, cách chọn hoa theo dịp và những gợi ý tinh tế cho những khoảnh khắc đặc biệt của bạn
          </motion.p>

          {/* Featured Blog Post - Hero Section */}
          {featuredBlog && (
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Link to={`/blog/${featuredBlog._id}`}>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <img
                        src={`${API_URL}${featuredBlog.image}`}
                        alt={featuredBlog.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-1/2 p-8 flex flex-col justify-center">
                      <div className="flex items-center mb-4">
                        <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm px-3 py-1 rounded-full">
                          Bài viết nổi bật
                        </span>
                        <span className="text-pink-500 text-sm ml-3 flex items-center">
                          <span className="mr-1"><FiTag /></span> {featuredBlog.category}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 hover:text-pink-600 transition-colors">
                        {featuredBlog.title}
                      </h2>
                      <p className="text-gray-600 mb-6 line-clamp-3">
                        {featuredBlog.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <span className="mr-1"><FiUser /></span> {featuredBlog.author}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1"><FiClock /></span> {new Date(featuredBlog.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="text-pink-600 font-medium flex items-center group">
                        Đọc tiếp
                        <span className="ml-1 group-hover:translate-x-1 transition-transform">
                          <FiChevronRight />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-xl mx-auto">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiSearch />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="w-full py-3 pl-12 pr-4 bg-white rounded-full border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex overflow-x-auto space-x-3 mb-10 pb-2 no-scrollbar">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                className={`px-5 py-2 rounded-full whitespace-nowrap ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveCategory(category)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* No Results */}
          {filteredBlogs.length === 0 && (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">Không tìm thấy bài viết</h3>
                <p className="text-gray-500 mb-6">Không có bài viết nào phù hợp với tiêu chí tìm kiếm của bạn</p>
                <button 
                  onClick={() => {
                    setActiveCategory('Tất cả');
                    setSearchTerm('');
                  }}
                  className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
                >
                  Xóa bộ lọc
                </button>
              </motion.div>
            </div>
          )}

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog, idx) => (
              <motion.div
                key={blog._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Link to={`/blog/${blog._id}`} className="block h-full">
                  <div className="relative">
                    <img
                      src={`${API_URL}${blog.image}`}
                      alt={blog.title}
                      className="w-full h-56 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-pink-600 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                      {blog.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-pink-600 transition-colors">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {blog.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4 mt-4">
                      <span className="flex items-center">
                        <span className="mr-1"><FiUser /></span> {blog.author}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1"><FiClock /></span> {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}