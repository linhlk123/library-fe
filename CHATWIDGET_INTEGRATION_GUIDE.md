# ChatWidget Integration Guide

## Overview
The refactored **ChatWidget** component now supports role-based styling and connects to the real Gemini AI backend via `/api/v1/ai-chat` endpoint.

## Features Implemented ✅

### 1. **Role-Based Props**
- **Prop**: `role?: 'USER' | 'STAFF'` (default: `'USER'`)
- **USER Role**: Indigo color scheme (indigo-600) - "BiblioBot"
- **STAFF Role**: Emerald color scheme (emerald-600) - "BiblioBot (Staff Assistant)"

### 2. **Real API Integration**
- Calls `POST /api/v1/ai-chat` with payload: `{ message: string, role: 'USER' | 'STAFF' }`
- Receives response: `{ reply: string }` (Markdown formatted from Gemini)
- 30-second timeout with proper error handling
- Graceful fallback error message: "Xin lỗi, BiblioBot đang bận sắp xếp sách, bạn thử lại sau nhé! 😅"

### 3. **Markdown Rendering**
- Uses **react-markdown** library (already installed)
- Renders Gemini's markdown responses with proper formatting:
  - **Bold text** (`**text**`)
  - *Italic text* (`*text*`)
  - Lists (`-`, `*`)
  - Code blocks
  - Automatic whitespace preservation (`white-space: pre-wrap`)

### 4. **Enhanced UX/UI**
- ✨ Loading animation (3 bouncing dots) while waiting for AI response
- 🎨 Smooth transitions and hover effects
- 📱 Responsive design (works on mobile and desktop)
- 🔒 Secure: disabled input while loading to prevent duplicate submissions
- ⚠️ Error state with visual feedback (red error banner)
- 🎯 Better shadows and z-index management

## Installation & Setup

### Step 1: Verify Dependencies
All required packages are already installed:
```bash
npm list react-markdown axios
```

Expected output:
```
├─ react-markdown@9.x.x (or higher)
└─ axios@1.15.0
```

### Step 2: Import in Layouts

#### **For Users** (d:\library-fe\src\layouts\UserLayout.tsx)
```tsx
import ChatWidget from '../components/ChatWidget';

export const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <ChatWidget role="USER" />  {/* Add this line */}
    </>
  );
};
```

#### **For Staff** (Create: d:\library-fe\src\layouts\StaffLayout.tsx)
```tsx
import ChatWidget from '../components/ChatWidget';

export const StaffLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      <Sidebar />
      <main>{children}</main>
      <ChatWidget role="STAFF" />  {/* Add this line */}
    </>
  );
};
```

### Step 3: Usage in Routes

#### In your routing/App.tsx:
```tsx
import { UserLayout } from './layouts/UserLayout';
import { StaffLayout } from './layouts/StaffLayout';
import CatalogViewWithCart from './views/user/CatalogViewWithCart';
import BorrowSlipManagerView from './pages/staff/BorrowSlipManagerView';

export const router = [
  {
    path: '/user/*',
    element: (
      <UserLayout>
        <CatalogViewWithCart />
      </UserLayout>
    ),
  },
  {
    path: '/staff/*',
    element: (
      <StaffLayout>
        <BorrowSlipManagerView />
      </StaffLayout>
    ),
  },
];
```

## Backend API Contract

### Endpoint: `POST /api/v1/ai-chat`

**Request:**
```json
{
  "message": "How can I search for books?",
  "role": "USER"
}
```

**Response:**
```json
{
  "reply": "You can search for books by:\n- Using the **Search bar** at the top\n- Filtering by **Category**\n- Browsing **New Arrivals**"
}
```

**Error Response:**
```json
{
  "error": "Service temporarily unavailable"
}
```

## Styling Reference

### Color Scheme

| Role | Primary | Hover | Theme |
|------|---------|-------|-------|
| USER | indigo-600 (#4f46e5) | indigo-700 (#4338ca) | Modern, Professional |
| STAFF | emerald-600 (#059669) | emerald-700 (#047857) | Admin, Distinct |

### Z-Index Stack
```
ChatWidget: z-50 (highest)
  ├─ Floating Button: bottom-6, right-6
  ├─ Chat Window: mb-4 (below floating button when open)
  └─ Messages: flex-col with proper layering
```

## Component Props Interface

```typescript
interface ChatWidgetProps {
  role?: 'USER' | 'STAFF';  // Default: 'USER'
}

// Example:
<ChatWidget role="STAFF" />
```

## Features Deep Dive

### Auto-Scroll
The component automatically scrolls to the latest message:
- Uses `useRef` with `scrollIntoView({ behavior: 'smooth' })`
- Triggers on new messages and typing indicator

### Loading States
```
1. User sends message → Input disabled, loading dots appear
2. API call in progress → Typing animation shows 3 bouncing dots
3. Response received → Message appears, input re-enabled
4. Error → Red error banner with fallback message
```

### Message Structure
```typescript
interface ChatMessage {
  id: string;           // Unique identifier (timestamp-based)
  text: string;         // Message content (supports Markdown)
  sender: 'USER' | 'BOT';
  timestamp: Date;
}
```

## Customization

### Modify Colors
Edit the `colorScheme` object in ChatWidget.tsx:
```typescript
const colorScheme = isStaff 
  ? {
      primary: '#059669',      // Emerald-600
      hover: '#047857',        // Emerald-700
      // ... other colors
    }
  : {
      primary: '#4f46e5',      // Indigo-600
      hover: '#4338ca',        // Indigo-700
      // ... other colors
    };
```

### Adjust Timeout
Default 30 seconds. Change in handleSend:
```typescript
timeout: 30000, // milliseconds
```

### Customize Error Message
Edit the fallback in handleSend:
```typescript
setError('Your custom error message here');
```

## Troubleshooting

### 1. **Chat Widget Not Showing**
- ✅ Verify component is imported in layout
- ✅ Check z-index: should be `z-50`
- ✅ Check bottom/right positioning: `bottom-6 right-6`

### 2. **API Calls Failing**
- ✅ Verify backend is running and `/api/v1/ai-chat` is available
- ✅ Check browser DevTools Network tab for error response
- ✅ Ensure CORS headers are properly configured

### 3. **Markdown Not Rendering**
- ✅ Verify `react-markdown` is installed: `npm list react-markdown`
- ✅ Check browser console for errors
- ✅ Verify response from backend includes Markdown syntax

### 4. **Colors Not Applying (STAFF Mode)**
- ✅ Verify `role="STAFF"` prop is passed correctly
- ✅ Hard refresh browser (Ctrl+Shift+R) to clear Tailwind cache
- ✅ Check that colorScheme object is properly defined

## Performance Optimization

### 1. Message Caching
Consider adding localStorage persistence:
```typescript
useEffect(() => {
  localStorage.setItem('chatMessages', JSON.stringify(messages));
}, [messages]);
```

### 2. Request Cancellation
Already implemented via `AbortController` to prevent stale requests.

### 3. Lazy Loading
Component is already isolated and won't affect app performance.

## Security Considerations

✅ **Input Sanitization**: React automatically escapes JSX content  
✅ **XSS Prevention**: React-markdown sanitizes HTML by default  
✅ **HTTPS**: Ensure `/api/v1/ai-chat` uses HTTPS in production  
✅ **Rate Limiting**: Implement on backend to prevent API abuse  

## Testing

### Manual Testing Checklist
- [ ] Chat opens/closes on button click
- [ ] Messages display correctly with USER color on right, BOT on left
- [ ] USER role shows indigo theme
- [ ] STAFF role shows emerald theme
- [ ] Markdown text renders (bold, italic, lists)
- [ ] Loading animation appears during API call
- [ ] Error message displays on failed request
- [ ] Auto-scroll works when new messages arrive
- [ ] Input is disabled during loading
- [ ] Component doesn't interfere with other page elements

### Example Test Messages
```
"**Bold text** and *italic* and - list items"
"Show me a list:\n- Item 1\n- Item 2"
"Code example: `const x = 5;`"
```

## Migration Notes

**From Previous Version:**
- ❌ Removed: Fake setTimeout with hardcoded responses
- ✅ Added: Real Axios API calls
- ✅ Added: React-markdown for rendering
- ✅ Added: Role-based color theming
- ✅ Added: Error handling with fallback messages
- ✅ Added: Request cancellation support
- ✅ Improved: Shadow and hover effects
- ✅ Improved: Loading animation and UX states

## Future Enhancements

1. **Message History Persistence**
   - Save conversations to localStorage or backend
   - Restore chat history on next visit

2. **Suggested Quick Replies**
   - Show common questions as buttons
   - Reduce typing for users

3. **File Attachments**
   - Allow uploading book covers or documents
   - Send as context to Gemini

4. **Typing Indicator from Bot**
   - Show "BiblioBot is typing..." indicator
   - Better feedback for slow API responses

5. **Multi-language Support**
   - Vietnamese/English toggle
   - Localized prompts and responses

## Support & Documentation

- React-Markdown Docs: https://github.com/remarkjs/react-markdown
- Axios Docs: https://axios-http.com/
- Tailwind CSS: https://tailwindcss.com/
- Gemini API: Check your backend documentation

---

**Last Updated**: April 2026  
**Version**: 2.0 (Refactored with Real API Integration)  
**Status**: ✅ Production Ready
