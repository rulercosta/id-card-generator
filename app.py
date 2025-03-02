from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for, flash, session
from functools import wraps
import os
from werkzeug.utils import secure_filename
import uuid
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username').strip() 
        password = request.form.get('password')
        
        stored_username = os.getenv('ADMIN_USERNAME')
        stored_password = os.getenv('ADMIN_PASSWORD')
        
        if username == stored_username and password == stored_password:
            session['logged_in'] = True
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password. Note: credentials are case-sensitive.')
            return redirect(url_for('login'))
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
@login_required
def upload_file():
    response = {'success': False, 'files': {}}
    
    upload_fields = ['participantImage', 'logo1', 'logo2', 'logo3']
    
    for field in upload_fields:
        if field in request.files:
            file = request.files[field]
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
                unique_filename = f"{field}_{uuid.uuid4().hex}.{file_ext}"
                
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(filepath)
                
                response['files'][field] = f"/static/uploads/{unique_filename}"
                response['success'] = True
    
    return jsonify(response)

@app.route('/uploads/<filename>')
@login_required
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/static/img/<filename>')
@login_required
def serve_placeholder(filename):
    return send_from_directory('static/img', filename)

@app.route('/cleanup', methods=['POST'])
@login_required
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