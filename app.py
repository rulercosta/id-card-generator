from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    response = {'success': False, 'files': {}}
    
    if 'participantImage' in request.files:
        file = request.files['participantImage']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
        file = request.files['participantImage']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
            unique_filename = f"participantImage_{uuid.uuid4().hex}.{file_ext}"
            
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(filepath)
            
            response['files']['participantImage'] = f"/uploads/{unique_filename}"
            response['success'] = True
    
    return jsonify(response)

@app.route('/static/img/<filename>')
def serve_placeholder(filename):
    return send_from_directory('static/img', filename)

@app.route('/cleanup', methods=['POST'])
def cleanup_files():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
        
    files_to_keep = request.json.get('files', [])
    cleaned = 0
    
    try:
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            if os.path.isfile(filepath) and filename not in files_to_keep:
                os.remove(filepath)
                cleaned += 1
                
        return jsonify({"success": True, "cleaned": cleaned})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)