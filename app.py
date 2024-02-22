from flask import Flask, render_template, request, jsonify
import firebase_admin
import requests
from firebase_admin import credentials, db, storage


cred = credentials.Certificate("secret _key/eventthem-cdb38-firebase-adminsdk-a11er-623cb9668a.json")
firebase_admin.initialize_app(cred,{
    'databaseURL': 'https://eventthem-cdb38-default-rtdb.firebaseio.com/',
    'storageBucket': 'eventthem-cdb38.appspot.com'

})


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/subscribe')
def subcribe():
    return render_template('subscribe.html')

@app.route('/subscribe_user', methods=['POST'])
def subscribe_user():
    try:
        # Get data from the request
        name = request.form['name']
        image_file = request.files['image']

        # Ensure the correct storage bucket is used
        bucket = storage.bucket(app=firebase_admin.get_app())
        
        # Upload image to Firebase Storage
        blob = bucket.blob('images/' + image_file.filename)
        blob.upload_from_file(image_file, content_type=image_file.content_type)
        blob.make_public()
        # Get the image URL
        image_url = blob.public_url

        # Save data to Firebase Realtime Database
        user_ref = db.reference('users')  # Change 'users' to your desired node
        new_user_ref = user_ref.push({
            'name': name,
            'image_url': image_url
        })

        return jsonify({'success': True, 'message': 'User subscribed successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
    


@app.route('/get_Match_user', methods=['GET'])
def get_Match_user():
    try:
        # Get data from the request
        name = request.form['name']
        image_file = request.files['image']

        # Ensure the correct storage bucket is used
        bucket = storage.bucket(app=firebase_admin.get_app())
        
        # Upload image to Firebase Storage
        blob = bucket.blob('images/' + image_file.filename)
        blob.upload_from_file(image_file, content_type=image_file.content_type)

        # Get the image URL
        image_url = blob.public_url

        # Save data to Firebase Realtime Database
        user_ref = db.reference('users')  # Change 'users' to your desired node
        new_user_ref = user_ref.push({
            'name': name,
            'image_url': image_url
        })

        return jsonify({'success': True, 'message': 'User subscribed successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
    
@app.route('/get_all_users', methods=['GET'])
def get_all_users():
    try:
        # Retrieve all users from the Realtime Database
        user_ref = db.reference('users')  # Change 'users' to your desired node
        users = user_ref.get()

        # Extract names and images from users
        user_data = [{'name': user['name'], 'image_url': user['image_url']} for user in users.values()]

        return jsonify({'success': True, 'users': user_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})






if __name__ == '__main__':
    app.run(debug=True)