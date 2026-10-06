import type { OcrRouteConfig } from '../types/ocr';

export const OCR_ROUTES: Record<string, OcrRouteConfig> = {
  '/': {
    path: '/',
    title: 'Image to Text Converter – Free Online OCR | TridentPDF',
    metaDescription:
      'Extract text from images online with a free browser-based OCR tool. Convert JPG, PNG and screenshots to editable text with 100% local processing and multilingual support.',
    h1: 'Image to Text Converter – Free Online OCR',
    subheading:
      'Extract text from images directly in your browser. Free, unlimited, completely private, with no file uploads and no watermarks.',
    defaultMode: 'standard',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/',
    introMarkdown:
      'Convert images to editable digital text in seconds. Whether extracting quotes from screenshots, digitizing paper documents, or transcribing multilingual photos, TridentPDF OCR processes every pixel directly inside your device memory using WebAssembly.',
    features: [
      {
        title: '100% Client-Side Privacy',
        desc: 'Images are processed directly in your browser using local WebAssembly. Zero files are uploaded to any external server.',
        icon: 'Shield',
      },
      {
        title: 'Over 30+ Languages Supported',
        desc: 'Accurately recognizes English, Hindi, Bengali, Assamese, Spanish, French, German, Arabic, Chinese, Japanese, and more.',
        icon: 'Languages',
      },
      {
        title: 'Advanced Preprocessing',
        desc: 'Built-in auto-enhancement, Otsu binarization, deskew angle correction, and sharpening maximize character recognition.',
        icon: 'Sliders',
      },
      {
        title: 'Instant Multi-Format Export',
        desc: 'Download extracted text as clean TXT, Microsoft Word (.docx), formatted PDF, structured CSV, or copy directly to clipboard.',
        icon: 'Download',
      },
    ],
    howItWorksSteps: [
      {
        step: 1,
        title: 'Select or Paste Your Image',
        desc: 'Upload JPG, PNG, WebP, BMP, or TIFF files. You can also paste screenshots directly with Ctrl+V or capture with your camera.',
      },
      {
        step: 2,
        title: 'Choose Target Language & Mode',
        desc: 'Select from 30+ language models and pick between Standard, Document, Screenshot, or Table OCR modes.',
      },
      {
        step: 3,
        title: 'Extract & Export Text',
        desc: 'Click Extract Text to run local OCR. Edit, search, format, or download your transcribed text immediately.',
      },
    ],
    faqs: [
      {
        question: 'Are my images uploaded to any remote server or cloud service?',
        answer:
          'No. Unlike conventional OCR cloud APIs that send your sensitive images to third-party servers, TridentPDF executes the optical character recognition engine entirely inside your web browser via Web Workers and WebAssembly. Your images never leave your computer or phone.',
      },
      {
        question: 'Is this OCR tool completely free with no usage limits?',
        answer:
          'Yes. There are no daily caps, no page quotas, no forced sign-ups, and no paywalls. You can process as many images and documents as you need.',
      },
      {
        question: 'Which image file formats are supported?',
        answer:
          'You can convert JPG, JPEG, PNG, WebP, BMP, GIF, SVG, and uncompressed TIFF images. Scanned documents and mobile photos are both supported.',
      },
      {
        question: 'Can I extract text from low-quality or rotated photos?',
        answer:
          'Yes. Use our built-in 1-click Auto Enhance or open the advanced preprocessing panel to adjust contrast, binarize with Otsu thresholding, straighten tilted pages with auto-deskew, and sharpen blurry fonts.',
      },
      {
        question: 'Does the tool add any watermarks to exported documents?',
        answer:
          'Never. All exported TXT, DOCX, and PDF documents are 100% clean and free of watermarks or promotional branding.',
      },
    ],
    bestPractices: [
      'Ensure the text in your image is sharp and legible with good contrast against the background.',
      'For scanned book pages or paper documents, switch to "Document OCR" mode and enable "Auto Enhance".',
      'For complex multi-script documents, select the primary script language model before extraction.',
    ],
  },

  '/image-to-text': {
    path: '/image-to-text',
    title: 'Image to Text Converter – Free Online OCR | TridentPDF',
    metaDescription:
      'Extract text from images online with a free browser-based OCR tool. Convert JPG, PNG and screenshots to editable text with 100% local processing.',
    h1: 'Image to Text Converter – Free Online OCR',
    subheading:
      'Convert images into editable text directly on your device. Fast, private, and unlimited.',
    defaultMode: 'standard',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/image-to-text',
    introMarkdown:
      'Extracting text from photos shouldn\'t require exposing sensitive data to cloud servers. Our browser-powered image to text converter runs local neural OCR algorithms on your device for rapid, private extraction.',
    features: [
      { title: 'Zero Cloud Transmission', desc: 'Complete confidentiality for invoices, contracts, receipts, and personal photos.', icon: 'Shield' },
      { title: 'Rich Formatting Preservation', desc: 'Preserves paragraphs, line breaks, and spatial reading order.', icon: 'FileText' },
      { title: 'In-Editor Find & Replace', desc: 'Instantly search, highlight, and replace words within your extracted transcription.', icon: 'Search' },
      { title: 'Batch Processing', desc: 'Queue 10 to 20 images at once and combine all extracted text into one document.', icon: 'Layers' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload Image', desc: 'Drag, drop, paste, or select your image files.' },
      { step: 2, title: 'Enhance Legibility', desc: 'Enable Auto Enhance or adjust threshold for crisp character edges.' },
      { step: 3, title: 'Download Extracted Text', desc: 'Export as TXT, Word (.docx), or Searchable PDF.' },
    ],
    faqs: [
      { question: 'How accurate is the image to text conversion?', answer: 'Accuracy depends on image resolution, contrast, and font sharpness. Clean printed text typically achieves 95-99% recognition accuracy, while handwritten text varies.' },
      { question: 'Can I copy the extracted text directly to my clipboard?', answer: 'Yes, click the "Copy Text" button to copy the entire transcription in one click.' },
    ],
    bestPractices: ['Aim for at least 300 DPI resolution for printed documents.', 'Crop unnecessary margins to focus the OCR engine on relevant text.'],
  },

  '/image-to-text-converter': {
    path: '/image-to-text-converter',
    title: 'Image to Text Converter Online – Free & Unlimited | TridentPDF',
    metaDescription:
      'Convert image to text online for free. Support for English, Hindi, Spanish, French, and 30+ languages with zero registration and zero file uploads.',
    h1: 'Image to Text Converter Online',
    subheading: 'High-quality optical character recognition that works entirely offline inside your browser.',
    defaultMode: 'standard',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/image-to-text-converter',
    introMarkdown:
      'Stop manually typing text from images. Our client-side Image to Text Converter extracts editable copy from scanned certificates, textbooks, receipts, and digital graphics with precision.',
    features: [
      { title: 'Unlimited Documents', desc: 'No daily image caps or subscription fees.', icon: 'Zap' },
      { title: 'High-Resolution Normalization', desc: 'Smart resolution scaling guarantees optimal character stroke recognition.', icon: 'Maximize2' },
      { title: 'Instant Word & Character Count', desc: 'Live statistics track character, word, and estimated reading times.', icon: 'BarChart' },
      { title: 'PWA & Offline Ready', desc: 'Caches language models in your browser so you can extract text without an internet connection.', icon: 'WifiOff' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Add Files', desc: 'Choose images or capture live photos with your webcam/camera.' },
      { step: 2, title: 'Select Language', desc: 'Pick the language corresponding to your document script.' },
      { step: 3, title: 'Save Transcripts', desc: 'Export directly to DOCX, TXT, or PDF with zero watermarks.' },
    ],
    faqs: [
      { question: 'Does this converter work on mobile phones?', answer: 'Yes, it works smoothly on both iOS Safari and Android Chrome, including direct camera capture.' },
      { question: 'Can I convert multiple images at once?', answer: 'Yes, select multiple images or drag a folder to process them sequentially in batch mode.' },
    ],
    bestPractices: ['Avoid harsh glare or uneven shadows when taking camera photos of documents.'],
  },

  '/ocr-online': {
    path: '/ocr-online',
    title: 'OCR Online – Free Browser-Based Text Extractor | TridentPDF',
    metaDescription:
      'Perform free OCR online without uploading files. Extract text from images, scanned documents, and screenshots directly in WebAssembly.',
    h1: 'OCR Online – Free In-Browser Optical Character Recognition',
    subheading: 'Run state-of-the-art WebAssembly OCR on your computer or phone. 100% private and limitless.',
    defaultMode: 'standard',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/ocr-online',
    introMarkdown:
      'Traditional online OCR platforms upload your personal documents to remote cloud servers. TridentPDF transforms your browser into a local OCR workstation, executing neural character recognition on your CPU/GPU without transmitting a single byte.',
    features: [
      { title: 'WASM Performance', desc: 'High-speed native C++ Tesseract compiled to WebAssembly for desktop performance.', icon: 'Cpu' },
      { title: 'Zero Data Retention', desc: 'All memory is cleared immediately when you reset your session.', icon: 'Trash2' },
      { title: '30+ Language Packs', desc: 'Intelligently downloads only the language dictionary you need.', icon: 'Globe' },
      { title: 'Bounding Box Visualizer', desc: 'Inspect spatial character detection directly on top of your original image.', icon: 'Eye' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Drop Image', desc: 'Drop any graphic or photo onto the workspace.' },
      { step: 2, title: 'Run OCR', desc: 'Execute on-device recognition with live progress tracking.' },
      { step: 3, title: 'Export', desc: 'Copy or download your transcription in one click.' },
    ],
    faqs: [
      { question: 'What does OCR stand for?', answer: 'OCR stands for Optical Character Recognition, a technology that converts typed, handwritten, or printed text into machine-encoded text.' },
      { question: 'Is my data safe during online OCR?', answer: 'With TridentPDF, yes. Because processing occurs entirely in client-side JavaScript and WebAssembly, no image or text data ever touches an external server.' },
    ],
    bestPractices: ['Use the Bounding Box overlay to verify words recognized in complex layouts.'],
  },

  '/extract-text-from-image': {
    path: '/extract-text-from-image',
    title: 'Extract Text From Image Online Free | TridentPDF',
    metaDescription:
      'Extract text from image online for free. Copy quotes, code, book excerpts, and invoices directly from picture to editable text.',
    h1: 'Extract Text From Image Online',
    subheading: 'Turn any picture or screenshot into editable, searchable text in seconds.',
    defaultMode: 'standard',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/extract-text-from-image',
    introMarkdown:
      'Need to extract text from a picture without retyping it? Simply upload or paste your image. Our in-browser recognition engine identifies letters, numbers, and symbols with spatial accuracy.',
    features: [
      { title: 'Fast Clipboard Paste', desc: 'Take a screenshot with Snipping Tool or Command+Shift+4 and paste with Ctrl+V.', icon: 'Clipboard' },
      { title: 'Custom Contrast Filters', desc: 'Optimize faded print or low-contrast backgrounds for maximum legibility.', icon: 'Sliders' },
      { title: 'Editable Text Area', desc: 'Make corrections directly inside the integrated result editor before downloading.', icon: 'Edit3' },
      { title: 'No Registration Required', desc: 'Start extracting text immediately without creating an account.', icon: 'CheckCircle' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Paste or Upload', desc: 'Paste your screenshot with Ctrl+V or upload your photo.' },
      { step: 2, title: 'Process', desc: 'Watch real-time character recognition progress.' },
      { step: 3, title: 'Copy', desc: 'Copy transcription or save as TXT/DOCX/PDF.' },
    ],
    faqs: [
      { question: 'Can I extract text from memes and social media pictures?', answer: 'Yes! Our preprocessing filters can remove background noise and sharpen meme captions for clean text extraction.' },
    ],
    bestPractices: ['Rotate upside-down or sideways images using the rotate button before extracting.'],
  },

  '/jpg-to-text': {
    path: '/jpg-to-text',
    title: 'JPG to Text Converter – Free Online OCR | TridentPDF',
    metaDescription:
      'Convert JPG and JPEG photos to editable text online. Free browser-based OCR with auto-enhancement and high-accuracy character recognition.',
    h1: 'JPG to Text Converter',
    subheading: 'Convert JPG and JPEG pictures into editable text documents directly in your browser.',
    defaultMode: 'standard',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/jpg-to-text',
    introMarkdown:
      'JPG photos often suffer from compression artifacts, uneven lighting, and lens tilt. Our JPG to text converter features built-in noise reduction and auto-enhancement to clean compression noise before recognizing characters.',
    features: [
      { title: 'Artifact Suppression', desc: 'Removes JPEG ringing artifacts around letters.', icon: 'Filter' },
      { title: 'Auto-Deskew', desc: 'Detects camera tilt and automatically straightens text lines.', icon: 'RotateCw' },
      { title: 'Multiple Language Support', desc: 'Recognizes Devanagari, Latin, Cyrillic, Arabic, and Asian scripts.', icon: 'Globe' },
      { title: 'Zero Upload Latency', desc: 'Processes large multi-megabyte camera photos instantly in RAM.', icon: 'Zap' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Select JPG Photo', desc: 'Upload your .jpg or .jpeg camera shot or document scan.' },
      { step: 2, title: 'Auto-Enhance', desc: 'Activate 1-click Auto Enhance to level contrast and denoise.' },
      { step: 3, title: 'Save Text', desc: 'Export as plain text, Word document, or PDF.' },
    ],
    faqs: [
      { question: 'Does JPG compression reduce OCR accuracy?', answer: 'Heavy compression can cause blurry letter edges. We recommend applying our "Sharpen" and "Auto Enhance" filters to restore contrast.' },
    ],
    bestPractices: ['Ensure phone camera is held parallel to the document surface to minimize perspective distortion.'],
  },

  '/png-to-text': {
    path: '/png-to-text',
    title: 'PNG to Text Converter – Free Transparent & UI OCR | TridentPDF',
    metaDescription:
      'Convert PNG images to text online. Perfect for high-resolution PNGs, transparent graphics, and screenshot text extraction.',
    h1: 'PNG to Text Converter',
    subheading: 'Extract crisp text from PNG images, icons, graphics, and transparent captures.',
    defaultMode: 'screenshot',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/png-to-text',
    introMarkdown:
      'PNG files offer lossless clarity, making them ideal for high-precision OCR. Our PNG converter handles transparent backgrounds by filling a crisp white matte, ensuring maximum character contrast for dark and light text alike.',
    features: [
      { title: 'Transparency Handling', desc: 'Fills transparent backgrounds with pure white for optimal OCR contrast.', icon: 'Image' },
      { title: 'Pixel-Perfect Font Recognition', desc: 'Recognizes modern digital sans-serif and monospace typefaces accurately.', icon: 'Type' },
      { title: 'Table & Code Extraction', desc: 'Great for terminal dumps, code snippets, and UI tables.', icon: 'Code' },
      { title: 'Instant Clipboard Workflow', desc: 'Capture with Snipping Tool and paste directly into the app.', icon: 'Clipboard' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Paste PNG', desc: 'Paste from clipboard or drag your PNG file.' },
      { step: 2, title: 'Screenshot Mode', desc: 'Utilize specialized digital screen optimization.' },
      { step: 3, title: 'Export Code or Text', desc: 'Copy or save your extracted output.' },
    ],
    faqs: [
      { question: 'Why does transparent PNG text sometimes fail in standard OCR?', answer: 'Transparent pixels can render as black in basic tools, causing dark text to vanish. Our tool automatically composites PNGs onto a clean white canvas.' },
    ],
    bestPractices: ['For dark mode screenshots with white text, toggle the "Invert" filter.'],
  },

  '/screenshot-to-text': {
    path: '/screenshot-to-text',
    title: 'Screenshot to Text Converter – OCR for UI, Code & Chats | TridentPDF',
    metaDescription:
      'Convert screenshots to text online for free. Extract error messages, chat logs, video subtitles, and code snippets directly from your screen.',
    h1: 'Screenshot to Text Converter',
    subheading: 'Instant OCR optimized for digital screens, chat transcripts, code snippets, and UI captures.',
    defaultMode: 'screenshot',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/screenshot-to-text',
    introMarkdown:
      'Ever encountered an unselectable error message, a YouTube video subtitle you wanted to copy, or an Instagram story caption? Screenshot OCR is calibrated for 72-96 DPI screen pixels, upscaling and sharpening digital text for flawless transcription.',
    features: [
      { title: 'Digital Font Optimization', desc: 'Tuned for Segoe UI, Roboto, SF Pro, and common system fonts.', icon: 'Monitor' },
      { title: 'Monospace Code Recognition', desc: 'Recognizes programming code, terminal logs, and JSON payloads.', icon: 'Terminal' },
      { title: 'Dark Mode Support', desc: '1-click Invert filter makes dark-theme captures readable by OCR.', icon: 'Moon' },
      { title: 'One-Click Copy', desc: 'Copy code or message text directly to your clipboard in under 2 seconds.', icon: 'Copy' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Capture Screen', desc: 'Press Windows+Shift+S (Windows) or Cmd+Shift+4 (Mac).' },
      { step: 2, title: 'Paste into Browser', desc: 'Press Ctrl+V anywhere on this page.' },
      { step: 3, title: 'Extract Instantly', desc: 'Click Extract to receive clean editable text.' },
    ],
    faqs: [
      { question: 'How do I extract text from dark mode screenshots?', answer: 'In the preprocessing panel, click "Invert" or "Auto Enhance" to flip light text on dark backgrounds into dark text on white.' },
      { question: 'Can it read code snippets without corrupting symbols?', answer: 'Yes! Our high-resolution upscaling preserves brackets, semicolons, and indentation.' },
    ],
    bestPractices: ['Zoom in slightly on your screen before taking the screenshot for best symbol clarity.'],
  },

  '/photo-to-text': {
    path: '/photo-to-text',
    title: 'Photo to Text Converter – Free Camera Photo OCR | TridentPDF',
    metaDescription:
      'Convert photos of books, receipts, signs, and paper documents to text online. Free mobile camera OCR with auto-perspective adjustment.',
    h1: 'Photo to Text Converter',
    subheading: 'Digitize books, whiteboards, paper receipts, and signs directly from smartphone photos.',
    defaultMode: 'document',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/photo-to-text',
    introMarkdown:
      'Snap a photo with your mobile phone and turn it into searchable digital notes. Our photo to text engine automatically corrects slight camera angle skews, enhances contrast under uneven room lighting, and transcribes whole pages effortlessly.',
    features: [
      { title: 'Live Camera Capture', desc: 'Take photos directly using your phone or laptop camera.', icon: 'Camera' },
      { title: 'Shadow & Vignette Correction', desc: 'Adaptive Otsu binarization eliminates shadow gradients on paper.', icon: 'Sun' },
      { title: 'Book & Magazine Mode', desc: 'Preserves multi-column reading order across dual pages.', icon: 'BookOpen' },
      { title: 'Multi-Format Export', desc: 'Download as Microsoft Word (.docx) or searchable PDF.', icon: 'FileCheck' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Take or Upload Photo', desc: 'Use camera capture or select a photo from your gallery.' },
      { step: 2, title: 'Enable Auto-Enhance', desc: 'Flattens lighting and sharpens book typography.' },
      { step: 3, title: 'Export Notes', desc: 'Save as text or Word document for study and work.' },
    ],
    faqs: [
      { question: 'What is the best way to photograph a book page for OCR?', answer: 'Ensure good overhead lighting without strong shadows, flatten the page, and hold your phone straight above the text.' },
    ],
    bestPractices: ['Avoid using flash on glossy magazine pages as glare obscures printed letters.'],
  },

  '/image-ocr': {
    path: '/image-ocr',
    title: 'Image OCR – Modern Client-Side Text Extraction | TridentPDF',
    metaDescription:
      'High-performance Image OCR running in your browser with WebAssembly. Unlimited text recognition with zero server uploads and 30+ languages.',
    h1: 'Image OCR – Optical Character Recognition',
    subheading: 'Private, browser-native optical character recognition engine with multithreaded performance.',
    defaultMode: 'standard',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/image-ocr',
    introMarkdown:
      'TridentPDF Image OCR leverages cutting-edge WebAssembly (WASM) to execute industrial-grade Tesseract neural models directly within your web browser. No cloud queue, no waiting, and zero privacy exposure.',
    features: [
      { title: 'Pure Client-Side Engine', desc: 'Processes directly in browser memory without sending data to servers.', icon: 'ShieldCheck' },
      { title: 'Granular Progress Metrics', desc: 'Follow engine initialization, language download, and recognition stages.', icon: 'Activity' },
      { title: 'Confidence Scoring', desc: 'View character and word confidence ratings to spot uncertain words quickly.', icon: 'Award' },
      { title: 'Spatial Word Boxes', desc: 'Visual overlay displays exact bounding boxes detected on the source image.', icon: 'Box' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload Graphic', desc: 'Accepts all standard web image formats.' },
      { step: 2, title: 'Run Local OCR', desc: 'Runs in a dedicated background Web Worker.' },
      { step: 3, title: 'Review Results', desc: 'Inspect confidence ratings and export in multiple formats.' },
    ],
    faqs: [
      { question: 'Why use client-side OCR instead of cloud APIs?', answer: 'Client-side OCR guarantees total data privacy, eliminates server costs and usage limits, works offline, and avoids cloud upload latency.' },
    ],
    bestPractices: ['Keep your browser tab open while large batch documents process in the background worker.'],
  },

  '/free-ocr': {
    path: '/free-ocr',
    title: 'Free OCR Online – 100% Unlimited Without Signup | TridentPDF',
    metaDescription:
      'Completely free OCR tool with no limits, no login required, no watermark, and no cloud uploads. Extract text from images anytime.',
    h1: 'Free OCR Online – 100% Unlimited & Private',
    subheading: 'No signup, no credits, no subscription, and no watermarks. Truly free client-side OCR for everyone.',
    defaultMode: 'standard',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/free-ocr',
    introMarkdown:
      'Most "free" OCR tools hit you with a 3-page daily limit, require your credit card, or plaster heavy watermarks on your exported PDF. TridentPDF believes basic document utilities should be genuinely free, private, and accessible to everyone.',
    features: [
      { title: 'No Artificial Usage Caps', desc: 'Convert as many pages, photos, and files as you need.', icon: 'Infinity' },
      { title: 'No Account or Email Needed', desc: 'Open the URL and start converting immediately.', icon: 'UserX' },
      { title: 'Clean Watermark-Free Export', desc: 'Your generated TXT, DOCX, and PDF files are 100% clean.', icon: 'Check' },
      { title: 'Commercial Use Allowed', desc: 'Use for personal projects, business paperwork, or academic research.', icon: 'Briefcase' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Open Tool', desc: 'No login or setup needed.' },
      { step: 2, title: 'Load Image', desc: 'Upload, drag, or paste your file.' },
      { step: 3, title: 'Get Text Free', desc: 'Copy or download your transcription immediately.' },
    ],
    faqs: [
      { question: 'Why is TridentPDF OCR free?', answer: 'Because all processing happens on your own device using WebAssembly, we do not have to pay expensive cloud server compute fees. This allows us to offer unlimited OCR completely free.' },
      { question: 'Are there hidden fees after a certain number of images?', answer: 'Never. No credits, no timers, and no paywalls.' },
    ],
    bestPractices: ['Bookmark this page to have an instant free OCR tool available on any device.'],
  },

  '/hindi-ocr': {
    path: '/hindi-ocr',
    title: 'Hindi OCR – Free Image to Hindi Text Converter (हिन्दी) | TridentPDF',
    metaDescription:
      'Extract Hindi text from images online for free (हिन्दी OCR). Convert JPG, PNG and scanned documents to editable Devanagari text with zero cloud upload.',
    h1: 'Hindi OCR – Free Image to Hindi Text Converter',
    subheading: 'Extract Devanagari Hindi text (हिन्दी) from photos, books, and scanned documents locally in your browser.',
    defaultMode: 'standard',
    defaultLanguage: 'hin',
    canonicalPath: 'https://everything-image-studio.web.app/hindi-ocr',
    introMarkdown:
      'Devanagari script features complex ligatures, matras (vowel signs), and conjunct consonants (संयुक्ताक्षर). Our Hindi OCR engine is powered by specialized Devanagari trained neural models that accurately identify matras, halants, and full sentences in clean Unicode Hindi.',
    features: [
      { title: 'Accurate Matra & Conjunct Detection', desc: 'Specialized for complex Devanagari ligatures (इ, ई, उ, ऊ, ऋ मात्राएँ एवं संयुक्ताक्षर).', icon: 'Type' },
      { title: 'Standard Unicode Hindi Output', desc: 'Outputs standard UTF-8 Hindi text ready for Word, WhatsApp, or web publication.', icon: 'Globe' },
      { title: 'Bilingual Support (Hindi + English)', desc: 'Reads mixed Hindi and English text in bills, government IDs, and textbooks.', icon: 'Languages' },
      { title: 'Zero Data Sharing', desc: '100% private in-browser recognition for Aadhaar cards, PAN cards, and legal notices.', icon: 'Shield' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload Hindi Document', desc: 'Select a scanned paper, book page, or photo in Hindi.' },
      { step: 2, title: 'Hindi Model Activated', desc: 'The Devanagari model is automatically loaded into your browser.' },
      { step: 3, title: 'Get Editable Hindi Text', desc: 'Copy Hindi Unicode text or save as Word document.' },
    ],
    faqs: [
      { question: 'Does this tool output Hindi in Unicode or legacy fonts (like Kruti Dev)?', answer: 'It outputs modern standard Unicode text (Mangal / Nirmala UI compatible), which works everywhere on modern devices without requiring legacy font installation.' },
      { question: 'Can it read mixed English and Hindi text?', answer: 'Yes, our model handles bilingual documents with English numerals, codes, and Devanagari phrases.' },
    ],
    bestPractices: ['Ensure matras (top and bottom diacritics) are clear and not cut off at page margins.'],
  },

  '/bengali-ocr': {
    path: '/bengali-ocr',
    title: 'Bengali OCR – Free Image to Bangla Text Converter (বাংলা) | TridentPDF',
    metaDescription:
      'Extract Bengali text from images online for free (বাংলা OCR). Convert scanned books, documents, and photos to editable Unicode Bangla text.',
    h1: 'Bengali OCR – Free Image to Bangla Text Converter',
    subheading: 'Extract Bangla text (বাংলা) from images, books, and official papers with 100% private browser processing.',
    defaultMode: 'standard',
    defaultLanguage: 'ben',
    canonicalPath: 'https://everything-image-studio.web.app/bengali-ocr',
    introMarkdown:
      'Bangla script features elaborate conjuncts (যুক্তাক্ষর) and top shirorekha (head lines). Our Bengali OCR module utilizes dedicated Bangla LSTM neural weights to transcribe scanned Bengali literature, legal papers, and newspaper clippings into clean Unicode Bangla text.',
    features: [
      { title: 'Bangla Yuktakkhor Recognition', desc: 'Accurately recognizes complex Bengali conjunct consonants (জ্ঞ, ক্ত, ঙ্গ, ক্ষ).', icon: 'Type' },
      { title: 'Clean Unicode Bangla', desc: 'Ready for copy-pasting into Facebook, Google Docs, or desktop word processors.', icon: 'CheckCircle' },
      { title: '100% Local Privacy', desc: 'Confidential documents like land deeds and voter cards remain private on your machine.', icon: 'Lock' },
      { title: 'Multi-Format Export', desc: 'Download as DOCX, TXT, or searchable PDF.', icon: 'Download' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload Bangla Photo', desc: 'Upload scanned page or book photo in Bengali.' },
      { step: 2, title: 'Bangla Model Engaged', desc: 'The Bengali OCR model initializes in your browser.' },
      { step: 3, title: 'Copy Bangla Text', desc: 'Receive editable Unicode Bangla transcription.' },
    ],
    faqs: [
      { question: 'Can it convert old Bengali printed books?', answer: 'Yes. For vintage or faded books, apply our "Auto Enhance" or "Contrast" slider to darken faded print and separate touching letters.' },
    ],
    bestPractices: ['Crop single columns at a time when scanning historic multi-column Bengali newspapers.'],
  },

  '/assamese-ocr': {
    path: '/assamese-ocr',
    title: 'Assamese OCR – Free Image to Assamese Text Converter (অসমীয়া) | TridentPDF',
    metaDescription:
      'Extract Assamese text from images online for free (অসমীয়া OCR). Convert photos and scanned documents to editable Unicode Assamese text locally.',
    h1: 'Assamese OCR – Free Image to Assamese Text Converter',
    subheading: 'Extract Assamese text (অসমীয়া) from photos and documents with browser-based neural recognition.',
    defaultMode: 'standard',
    defaultLanguage: 'asm',
    canonicalPath: 'https://everything-image-studio.web.app/assamese-ocr',
    introMarkdown:
      'Recognizing Assamese script (অসমীয়া লিপি) requires dedicated handling for distinctive characters like ৰ (ro) and ৱ (wo) alongside intricate conjuncts. TridentPDF provides native Assamese model support with client-side execution.',
    features: [
      { title: 'Assamese Character Distinctions', desc: 'Accurately distinguishes ৰ, ৱ, and Assamese-specific orthography from Bengali.', icon: 'CheckCircle' },
      { title: 'Pure Unicode Assamese', desc: 'Generates standardized UTF-8 text for modern publishing and communication.', icon: 'Globe' },
      { title: 'Fast Client-Side Execution', desc: 'Runs locally on your computer or phone without server bottlenecks.', icon: 'Zap' },
      { title: 'Zero Watermark', desc: 'Export unencumbered, professional documents.', icon: 'FileText' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload Assamese Image', desc: 'Select your photo or scan containing Assamese text.' },
      { step: 2, title: 'Process Locally', desc: 'On-device recognition transcribes characters in real time.' },
      { step: 3, title: 'Export', desc: 'Copy to clipboard or download as TXT/DOCX/PDF.' },
    ],
    faqs: [
      { question: 'Does this OCR support both Assamese characters ৰ and ৱ?', answer: 'Yes, our model uses the official Assamese (asm) dictionary trained specifically on Assamese texts and letterforms.' },
    ],
    bestPractices: ['Ensure adequate image resolution so delicate loops in Assamese characters remain distinct.'],
  },

  '/table-ocr': {
    path: '/table-ocr',
    title: 'Table OCR – Extract Tables from Images to CSV & Excel | TridentPDF',
    metaDescription:
      'Extract tables from images and screenshots directly to CSV. Convert tabular image data into structured rows and columns in your browser.',
    h1: 'Table OCR – Extract Tabular Data to CSV & Spreadsheets',
    subheading: 'Automatically detect table rows and columns from image captures and export directly to CSV.',
    defaultMode: 'table',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/table-ocr',
    introMarkdown:
      'Copying data cell-by-cell from a screenshot of a spreadsheet, invoice, or financial statement is tedious and error-prone. Table OCR analyzes spatial word bounding boxes to cluster text into rows and columns, providing an interactive grid preview and 1-click CSV download.',
    features: [
      { title: 'Spatial Grid Detection', desc: 'Calculates X and Y centroids of words to group items into aligned columns and rows.', icon: 'Grid' },
      { title: 'Editable Table Grid Preview', desc: 'Preview and edit cell contents directly inside an interactive table before exporting.', icon: 'Table' },
      { title: '1-Click CSV Export', desc: 'Download standard comma-separated values compatible with Microsoft Excel and Google Sheets.', icon: 'Download' },
      { title: 'Confidential Financial Data', desc: 'Balance sheets, receipts, and bank statements are processed in memory with zero cloud risk.', icon: 'ShieldCheck' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload Table Image', desc: 'Capture or upload a screenshot of your table or spreadsheet.' },
      { step: 2, title: 'Detect Structure', desc: 'The engine clusters words into corresponding rows and column slots.' },
      { step: 3, title: 'Export to CSV / Excel', desc: 'Review the interactive grid and download CSV in one click.' },
    ],
    faqs: [
      { question: 'Can I open the exported CSV in Microsoft Excel or Google Sheets?', answer: 'Yes, the generated CSV file follows standard RFC 4180 format and opens immediately in Excel, Google Sheets, LibreOffice Calc, or Apple Numbers.' },
      { question: 'What if table border lines are missing in my screenshot?', answer: 'Our spatial clustering algorithm works with both bordered tables and borderless aligned column text by measuring horizontal and vertical whitespace.' },
    ],
    bestPractices: ['Ensure column headers are clearly visible and columns have discernible horizontal separation.'],
  },

  '/document-ocr': {
    path: '/document-ocr',
    title: 'Document OCR – Scanned PDF, Invoice & Contract Text Extraction | TridentPDF',
    metaDescription:
      'Extract text from scanned documents, contracts, agreements, and invoices with layout preservation. 100% private client-side OCR.',
    h1: 'Document OCR – Scanned Paper & Contract Text Extraction',
    subheading: 'Digitize paper documents, signed contracts, and invoices with paragraph and layout preservation.',
    defaultMode: 'document',
    defaultLanguage: 'eng',
    canonicalPath: 'https://everything-image-studio.web.app/document-ocr',
    introMarkdown:
      'Scanned paper documents require special treatment: preserving paragraphs, maintaining reading flow, and overcoming scan skew. Document OCR combines auto-deskew, Otsu binarization, and paragraph grouping to recreate structured editable documents.',
    features: [
      { title: 'Layout & Paragraph Preservation', desc: 'Preserves logical paragraph breaks, headers, and bulleted line items.', icon: 'FileText' },
      { title: 'Auto-Deskew Straightening', desc: 'Measures projection angle to straighten pages scanned crookedly.', icon: 'RotateCcw' },
      { title: 'Searchable PDF & DOCX Export', desc: 'Download formatted Microsoft Word files or clean text documents.', icon: 'Download' },
      { title: 'Strict Enterprise Privacy', desc: 'Non-disclosure agreements, patient records, and tax filings remain 100% local on your device.', icon: 'Lock' },
    ],
    howItWorksSteps: [
      { step: 1, title: 'Select Document Scan', desc: 'Upload scanned paper document or multi-page image files.' },
      { step: 2, title: 'Document Optimization', desc: 'Auto-deskew straightens pages and Otsu removes scanner background grey.' },
      { step: 3, title: 'Download Searchable File', desc: 'Export clean Word document (.docx) or PDF with preserved paragraphs.' },
    ],
    faqs: [
      { question: 'Can Document OCR handle slanted scans?', answer: 'Yes, our built-in auto-deskew detects angle variances from -15 to +15 degrees and straightens the page automatically before OCR.' },
      { question: 'Is it safe for legally privileged or confidential documents?', answer: 'Yes. Because no data is sent over the internet or logged on any server, it complies with strict client-confidentiality requirements.' },
    ],
    bestPractices: ['For high-volume contracts, scan at 300 DPI black and white for lightning-fast recognition.'],
  },
};

export function getRouteConfig(pathname: string): OcrRouteConfig {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  return OCR_ROUTES[normalized] || OCR_ROUTES['/'];
}
