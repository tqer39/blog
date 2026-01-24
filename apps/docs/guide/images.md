# Images

This guide explains how to add images to your blog articles.

## Uploading Images

### Using Admin UI

1. Open the Admin UI at `/admin`
2. Navigate to the article editor
3. Click the image upload button in the toolbar
4. Select your image file
5. The image URL will be automatically inserted

### Supported Formats

- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)
- SVG (`.svg`)

## Markdown Syntax

### Basic Image

```markdown
![Alt text](/images/example.jpg)
```

### Image with Title

```markdown
![Alt text](/images/example.jpg "Image title")
```

The title appears as a tooltip on hover.

## Image Sizing

### Width Specification

Add a query parameter to control width:

```markdown
![Alt text](/images/example.jpg?w=600)
```

### Height Specification

```markdown
![Alt text](/images/example.jpg?h=400)
```

### Both Dimensions

```markdown
![Alt text](/images/example.jpg?w=600&h=400)
```

::: warning
When specifying both dimensions, the image may be cropped to fit. Use only width for responsive images.
:::

## Captions

Add a caption below the image using emphasis:

```markdown
![Mountain landscape](/images/mountain.jpg)
*Photo taken at Mt. Fuji, 2024*
```

## CDN URLs

Images uploaded through the Admin UI are automatically served via CDN:

```text
https://cdn.blog.tqer39.dev/images/{image-id}.{ext}
```

### URL Structure

| Part | Description |
|------|-------------|
| `cdn.blog.tqer39.dev` | CDN domain |
| `images` | Image directory |
| `{image-id}` | Unique image identifier |
| `{ext}` | File extension |

## Best Practices

1. **Use descriptive alt text** - Important for accessibility
2. **Optimize before upload** - Keep file sizes reasonable
3. **Use WebP when possible** - Better compression
4. **Add captions for context** - Help readers understand the image

## Linking Images

Make an image clickable:

```markdown
[![Alt text](/images/thumbnail.jpg)](/images/full-size.jpg)
```
