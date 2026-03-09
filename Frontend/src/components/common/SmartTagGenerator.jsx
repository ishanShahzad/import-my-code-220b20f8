import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Tag, Loader2, Check, X, Wand2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'

const SmartTagGenerator = ({ productId, currentTags = [], onTagsUpdated, productData }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const { token } = useAuth()

  const generateTags = async () => {
    if (!productId) {
      toast.error('Save the product first to generate tags')
      return
    }
    
    setIsGenerating(true)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/smart-tags/generate/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      toast.success(`Generated ${res.data.newTags?.length || 0} new tags!`)
      if (onTagsUpdated) {
        onTagsUpdated(res.data.tags)
      }
    } catch (error) {
      console.error('Tag generation error:', error)
      toast.error('Failed to generate tags')
    } finally {
      setIsGenerating(false)
    }
  }

  const fetchSuggestions = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/smart-tags/suggestions`,
        productData || {}
      )
      setSuggestions(res.data)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const applySelectedTags = () => {
    if (selectedTags.length > 0 && onTagsUpdated) {
      const newTags = [...new Set([...currentTags, ...selectedTags])]
      onTagsUpdated(newTags)
      setSelectedTags([])
      setShowSuggestions(false)
      toast.success(`Added ${selectedTags.length} tags`)
    }
  }

  return (
    <div className="space-y-3">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateTags}
          disabled={isGenerating || !productId}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
          style={{ 
            background: 'linear-gradient(135deg, hsl(280, 70%, 50%), hsl(320, 60%, 55%))',
            color: 'white'
          }}
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Wand2 size={16} />
          )}
          AI Generate Tags
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchSuggestions}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm glass-button"
        >
          <Tag size={16} />
          Browse Suggestions
        </motion.button>
      </div>

      {/* Current Tags Display */}
      {currentTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentTags.map(tag => (
            <span key={tag} className="tag-pill text-xs font-medium flex items-center gap-1">
              {tag}
              <button 
                onClick={() => onTagsUpdated && onTagsUpdated(currentTags.filter(t => t !== tag))}
                className="hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Suggestions Modal */}
      <AnimatePresence>
        {showSuggestions && suggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-inner p-4 rounded-xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Sparkles size={16} style={{ color: 'hsl(var(--primary))' }} />
                Tag Suggestions
              </h4>
              <button onClick={() => setShowSuggestions(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <X size={16} />
              </button>
            </div>

            {/* Smart Suggestions */}
            {suggestions.smartSuggestions?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold mb-2" style={{ color: 'hsl(280, 70%, 60%)' }}>
                  AI Recommended
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.smartSuggestions.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedTags.includes(tag) || currentTags.includes(tag)
                          ? 'bg-purple-500/30 border-purple-400'
                          : 'bg-white/10 hover:bg-white/20'
                      } border border-transparent`}
                      style={{
                        borderColor: selectedTags.includes(tag) ? 'hsl(280, 70%, 60%)' : 'transparent'
                      }}
                    >
                      {selectedTags.includes(tag) && <Check size={12} className="inline mr-1" />}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category-based Suggestions */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {Object.entries(suggestions.categories || {}).map(([category, tags]) => (
                <div key={category}>
                  <p className="text-xs font-semibold mb-1.5 capitalize" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        disabled={currentTags.includes(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          currentTags.includes(tag)
                            ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                            : selectedTags.includes(tag)
                            ? 'bg-primary/30'
                            : 'bg-white/5 hover:bg-white/15'
                        }`}
                      >
                        {currentTags.includes(tag) && <Check size={10} className="inline mr-1" />}
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Apply Button */}
            {selectedTags.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={applySelectedTags}
                className="mt-4 w-full py-2 rounded-xl font-semibold text-sm"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(150, 60%, 45%), hsl(180, 50%, 45%))',
                  color: 'white'
                }}
              >
                Apply {selectedTags.length} Tag{selectedTags.length !== 1 ? 's' : ''}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SmartTagGenerator
