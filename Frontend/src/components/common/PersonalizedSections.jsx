import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, TrendingUp, Bell, DollarSign, Heart, Clock, MapPin, Gift } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useCurrency } from '../../contexts/CurrencyContext'
import ProductCard from './ProductCard'

const PersonalizedSections = () => {
  const { currentUser, token } = useAuth()
  const { formatPrice } = useCurrency()
  
  const [pickedForYou, setPickedForYou] = useState([])
  const [trending, setTrending] = useState([])
  const [priceDrops, setPriceDrops] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPersonalizedData()
  }, [currentUser])

  const fetchPersonalizedData = async () => {
    setLoading(true)
    try {
      // Fetch all products
      const res = await axios.get(`${import.meta.env.VITE_API_URL}api/products/get-products?limit=50`)
      const allProducts = res.data.products || []

      // Get browsing history from localStorage
      const viewedIds = JSON.parse(localStorage.getItem('viewedProducts') || '[]')
      const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory') || '[]')
      
      // Recently viewed products
      const viewed = allProducts.filter(p => viewedIds.includes(p._id)).slice(0, 6)
      setRecentlyViewed(viewed)

      // Determine user preferences from history
      const preferredCategories = [...new Set(viewed.map(p => p.category))]
      const preferredBrands = [...new Set(viewed.map(p => p.brand))]
      const avgPriceRange = viewed.length > 0 
        ? viewed.reduce((sum, p) => sum + p.price, 0) / viewed.length 
        : 100

      // Picked for You - based on preferences or random if no history
      let picked = []
      if (preferredCategories.length > 0) {
        picked = allProducts
          .filter(p => preferredCategories.includes(p.category) || preferredBrands.includes(p.brand))
          .filter(p => !viewedIds.includes(p._id))
          .slice(0, 8)
      }
      if (picked.length < 4) {
        // Fill with random products
        const randomPicks = allProducts
          .filter(p => !picked.find(pp => pp._id === p._id))
          .sort(() => Math.random() - 0.5)
          .slice(0, 8 - picked.length)
        picked = [...picked, ...randomPicks]
      }
      setPickedForYou(picked)

      // Trending - products with most reviews and high ratings
      const trendingProducts = [...allProducts]
        .sort((a, b) => (b.numReviews * b.rating) - (a.numReviews * a.rating))
        .slice(0, 8)
      setTrending(trendingProducts)

      // Price Drops - products with discounts
      const discounted = allProducts
        .filter(p => p.discountedPrice > 0 && p.discountedPrice < p.price)
        .sort((a, b) => {
          const discountA = ((a.price - a.discountedPrice) / a.price) * 100
          const discountB = ((b.price - b.discountedPrice) / b.price) * 100
          return discountB - discountA
        })
        .slice(0, 8)
      setPriceDrops(discounted)

    } catch (error) {
      console.error('Error fetching personalized data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Track product views
  useEffect(() => {
    const trackView = (productId) => {
      const viewed = JSON.parse(localStorage.getItem('viewedProducts') || '[]')
      if (!viewed.includes(productId)) {
        viewed.unshift(productId)
        localStorage.setItem('viewedProducts', JSON.stringify(viewed.slice(0, 20)))
      }
    }
    
    // Expose tracking function globally
    window.trackProductView = trackView
  }, [])

  const SectionHeader = ({ icon: Icon, title, subtitle, color, link }) => (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <div className="glass-inner p-2 rounded-xl" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
          {subtitle && (
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{subtitle}</p>
          )}
        </div>
      </div>
      {link && (
        <Link to={link} className="tag-pill text-xs font-medium hover:scale-105 transition-transform">
          View All →
        </Link>
      )}
    </div>
  )

  const ProductScroller = ({ products }) => (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
      {products.map((product, idx) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="shrink-0 w-48 sm:w-56"
        >
          <ProductCard {...product} idx={idx} compact />
        </motion.div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-panel p-4 rounded-2xl">
            <div className="h-6 w-48 bg-white/10 rounded mb-4" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="w-48 h-64 bg-white/5 rounded-xl shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Picked for You */}
      {pickedForYou.length > 0 && (
        <section className="glass-panel p-4 sm:p-6 rounded-2xl">
          <SectionHeader 
            icon={Sparkles} 
            title="Picked for You" 
            subtitle={currentUser ? "Based on your interests" : "Products you might love"}
            color="hsl(280, 70%, 60%)"
          />
          <ProductScroller products={pickedForYou} />
        </section>
      )}

      {/* Price Drops */}
      {priceDrops.length > 0 && (
        <section className="glass-panel p-4 sm:p-6 rounded-2xl" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
          <SectionHeader 
            icon={DollarSign} 
            title="Price Drops" 
            subtitle="Hot deals on watched items"
            color="hsl(0, 70%, 55%)"
          />
          <ProductScroller products={priceDrops} />
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="glass-panel p-4 sm:p-6 rounded-2xl">
          <SectionHeader 
            icon={TrendingUp} 
            title="Trending Now" 
            subtitle="Most popular products"
            color="hsl(150, 60%, 45%)"
          />
          <ProductScroller products={trending} />
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="glass-panel p-4 sm:p-6 rounded-2xl">
          <SectionHeader 
            icon={Clock} 
            title="Recently Viewed" 
            subtitle="Continue where you left off"
            color="hsl(200, 80%, 55%)"
          />
          <ProductScroller products={recentlyViewed} />
        </section>
      )}

      {/* Gift Ideas */}
      {pickedForYou.length > 4 && (
        <section className="glass-panel p-4 sm:p-6 rounded-2xl" style={{ background: 'rgba(236, 72, 153, 0.05)' }}>
          <SectionHeader 
            icon={Gift} 
            title="Gift Ideas" 
            subtitle="Perfect presents for loved ones"
            color="hsl(330, 80%, 60%)"
          />
          <ProductScroller products={pickedForYou.slice(0, 4).sort(() => Math.random() - 0.5)} />
        </section>
      )}
    </div>
  )
}

export default PersonalizedSections
