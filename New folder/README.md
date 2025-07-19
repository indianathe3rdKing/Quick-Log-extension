# Quick Dictionary Extension

A Chrome extension that provides instant word definitions with a simple text selection. Just select any word on any website and get immediate dictionary definitions in a beautifully styled popup.

## Features

- 🔍 **Instant Definitions**: Select any word on any website to get immediate definitions
- 🎨 **Beautiful UI**: Dark-themed popup with custom Titillium Web font
- 📍 **Smart Positioning**: Popup appears right next to your mouse cursor
- 🔄 **Auto-Close**: Popup automatically disappears when you clear your selection
- 📊 **Data Logging**: Automatically logs searched words with timestamps to Pipedream
- 🌐 **Universal**: Works on any website (HTTP/HTTPS)

## How It Works

### For Users

1. **Install the Extension**: Load the extension in Chrome
2. **Browse Any Website**: Visit any website with text content
3. **Select a Word**: Simply highlight/select any word on the page
4. **Get Definition**: After 1 second, a popup will appear with the word's definition
5. **Auto-Close**: The popup disappears when you clear your selection or click "Close"

### Technical Process

1. **Text Selection Detection**: The extension listens for text selection changes on web pages
2. **Word Validation**: Checks if the selected text is a valid single word (alphabetic characters only)
3. **Debounced API Call**: After 1 second delay, makes a request to Merriam-Webster's Collegiate Dictionary API
4. **Definition Display**: Shows multiple definitions in a formatted popup near the mouse cursor
5. **Data Logging**: Sends the word and definitions to Pipedream for analytics

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will be automatically active on all websites

## Files Structure

```
ext/
├── manifest.json          # Extension configuration
├── background.js          # Background script for initialization
├── content.js            # Main functionality script
├── popup.html            # Extension popup (if needed)
├── icon.png              # Extension icon
└── README.md             # This file
```

## Configuration

### API Keys

The extension uses Merriam-Webster's Collegiate Dictionary API:

- **API Key**: `e9299ad3-f9cc-4ecf-919e-55f25b2326a2`
- **Endpoint**: `https://dictionaryapi.com/api/v3/references/collegiate/json/`

### Data Logging

Words and definitions are logged to Pipedream webhook:

- **Endpoint**: `https://eonn7e5d997c5tv.m.pipedream.net`

## Customization

### Styling

The popup appearance can be customized in the `showPopup()` function in `content.js`:

- **Background**: `#292a2d` (dark gray)
- **Text Color**: `#cfd0d3` (light gray)
- **Font**: Titillium Web (loaded from Google Fonts)
- **Button Color**: `rgb(6, 56, 136)` (dark blue)

### Timing

- **Debounce Delay**: 1000ms (1 second) - can be adjusted in the event listener
- **Popup Position**: 10px right, 10px up from mouse cursor

## Browser Support

- ✅ Chrome (Manifest V3)
- ✅ Microsoft Edge
- ✅ Other Chromium-based browsers

## Permissions

The extension requires:

- **Active Tab**: To inject content scripts
- **Scripting**: To execute scripts on web pages
- **Host Permissions**: `<all_urls>` to work on all websites

## Privacy

- The extension only processes text you actively select
- Word definitions are fetched from Merriam-Webster's public API
- Search data is logged to Pipedream for analytics (word + timestamp)
- No personal information or browsing history is collected

## Troubleshooting

### Extension Not Working

1. Check if the extension is enabled in `chrome://extensions/`
2. Refresh the webpage you're testing on
3. Ensure you're selecting single words (not phrases)

### No Definitions Appearing

1. Check the browser console (F12) for error messages
2. Verify internet connection
3. Try selecting different words

### API Errors

- The extension shows "Definition not available" if the API fails
- Check console logs for detailed error information

## Development

### Local Development

1. Clone the repository
2. Make changes to the source files
3. Go to `chrome://extensions/` and click "Reload" on the extension
4. Test on any website

### Adding Features

- Modify `content.js` for core functionality
- Update `manifest.json` for permissions or settings
- Style changes can be made in the `showPopup()` function

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues or questions:

1. Check the browser console for error messages
2. Verify all files are properly loaded
3. Ensure the API keys are valid and active

---

**Happy word hunting! 📚✨**
