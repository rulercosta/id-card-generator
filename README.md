# Modern ID Card Generator

A web application for generating professional ID cards with modern design and interactive features.

## Features

- Upload logos and photo
- Enter details (name, role, ID number, etc.)
- Real-time preview of ID card with front and back sides
- Download ID card in .pdf format
- Responsive mobile first layout

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/rulercosta/id-card-generator.git
   cd id-card-generator
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application:
   ```bash
   python app.py
   ```

5. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000/
   ```

## Project Structure

```
id-card-generator/
│
├── app.py                   # Flask application entry point
│
├── templates/
│   └── index.html           # Main HTML template
│
├── static/
│   ├── css/
│   │   └── styles.css       # CSS styles for the application
│   │
│   ├── js/
│   │   └── script.js        # JavaScript for dynamic functionality
│   │
│   ├── img/                 # Default images
│   │   ├── placeholder-logo.png
│   │   └── placeholder-person.png
│   │
│   └── uploads/             # Folder for uploaded images (created automatically)
│
└── requirements.txt         # Python dependencies
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.