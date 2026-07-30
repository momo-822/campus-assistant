import { createContext, useContext, useState, type ReactNode } from 'react'

interface FavoritesContextType {
  favoriteItems: number[]
  favoritePosts: number[]
  toggleItem: (id: number) => void
  togglePost: (id: number) => void
  isItemFavorited: (id: number) => boolean
  isPostFavorited: (id: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteItems: [],
  favoritePosts: [],
  toggleItem: () => {},
  togglePost: () => {},
  isItemFavorited: () => false,
  isPostFavorited: () => false,
})

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // 预置一些收藏数据，用于展示收藏按钮交互效果
  const [favoriteItems, setFavoriteItems] = useState<number[]>([1, 2])
  const [favoritePosts, setFavoritePosts] = useState<number[]>([1, 2])

  const toggleItem = (id: number) => {
    setFavoriteItems((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    )
  }

  const togglePost = (id: number) => {
    setFavoritePosts((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    )
  }

  const isItemFavorited = (id: number) => favoriteItems.includes(id)
  const isPostFavorited = (id: number) => favoritePosts.includes(id)

  return (
    <FavoritesContext.Provider
      value={{ favoriteItems, favoritePosts, toggleItem, togglePost, isItemFavorited, isPostFavorited }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}