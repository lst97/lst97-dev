'use client'

import { usePosts } from '@/frontend/hooks/usePosts'

export function TestPosts() {
  const { posts, isLoading, error } = usePosts()

  if (isLoading) return <div>Loading posts...</div>
  if (error) return <div>Error loading posts: {error.message}</div>

  return (
    <div>
      <h2>Posts from Custom API</h2>
      {posts.length === 0 ? (
        <p>No posts found</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <div>Categories: {post.categories.join(', ')}</div>
              <div>Read time: {post.readtime} min</div>
              <div>Content length: {post.content.length} (Should be 0 in list view)</div>
              <div>Post ID: {post.id}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function TestSinglePost({ id }: { id: string }) {
  const { post, isLoading, error } = usePosts(id)

  if (isLoading) return <div>Loading post...</div>
  if (error) return <div>Error loading post: {error.message}</div>
  if (!post) return <div>Post not found</div>

  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.description}</p>
      <div>Categories: {post.categories.join(', ')}</div>
      <div>Read time: {post.readtime} min</div>
      <div>Content length: {post.content.length} (Should have full content)</div>
      {/* Display content - would need a rich text renderer component */}
    </div>
  )
}
