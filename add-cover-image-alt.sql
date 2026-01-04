-- Add cover_image_alt column to posts table for SEO-optimized alt text
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS cover_image_alt VARCHAR(125);

-- Add comment to explain the column
COMMENT ON COLUMN posts.cover_image_alt IS 'SEO-optimized alt text for cover image (max 125 characters)';
