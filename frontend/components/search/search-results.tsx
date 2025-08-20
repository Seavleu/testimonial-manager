'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SearchResult, searchService } from '@/lib/search'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MessageSquare, 
  BarChart3, 
  Zap, 
  Palette, 
  ExternalLink,
  Clock,
  Building,
  User,
  Star
} from 'lucide-react'

interface SearchResultsProps {
  query: string
  userId: string
  onResultClick?: () => void
}

const typeIcons = {
  testimonial: MessageSquare,
  analytics: BarChart3,
  automation: Zap,
  widget: Palette
}

const typeColors = {
  testimonial: 'bg-blue-100 text-blue-800',
  analytics: 'bg-green-100 text-green-800',
  automation: 'bg-purple-100 text-purple-800',
  widget: 'bg-orange-100 text-orange-800'
}

export function SearchResults({ query, userId, onResultClick }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (query.trim()) {
      performSearch()
    } else {
      setResults([])
    }
  }, [query, userId])

  const performSearch = async () => {
    setLoading(true)
    setError(null)

    try {
      const searchResults = await searchService.search({
        query,
        userId,
        limit: 10
      })

      setResults(searchResults)
      
      // Save search query for analytics
      await searchService.saveSearchQuery(query, userId)
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to perform search. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.()
    router.push(result.url)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center space-x-2 text-gray-500">
          <Search className="h-4 w-4 animate-pulse" />
          <span>Searching...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    )
  }

  if (!query.trim()) {
    return (
      <div className="p-4">
        <div className="text-gray-500 text-sm">Start typing to search...</div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No results found for "{query}"</p>
          <p className="text-xs mt-1">Try different keywords or check your spelling</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 max-h-96 overflow-y-auto">
      <div className="space-y-2">
        {results.map((result) => {
          const IconComponent = typeIcons[result.type]
          
          return (
            <Card 
              key={result.id} 
              className="cursor-pointer hover:bg-gray-50 transition-colors border-0 shadow-sm"
              onClick={() => handleResultClick(result)}
            >
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${typeColors[result.type]}`}
                      >
                        {result.type}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {result.description}
                    </p>
                    
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      {result.metadata?.status && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(result.metadata.status)}`}
                        >
                          {result.metadata.status}
                        </Badge>
                      )}
                      
                      {result.metadata?.date && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(result.metadata.date)}</span>
                        </div>
                      )}
                      
                      {result.metadata?.company && (
                        <div className="flex items-center space-x-1">
                          <Building className="h-3 w-3" />
                          <span>{result.metadata.company}</span>
                        </div>
                      )}
                      
                      {result.metadata?.type && (
                        <div className="flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>{result.metadata.type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {results.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{results.length} result{results.length !== 1 ? 's' : ''} found</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6 px-2"
              onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
            >
              View all results
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
