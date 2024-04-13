from flask import Flask, render_template, request, jsonify
import firebase_admin
import requests
from firebase_admin import credentials, db, storage
import os

cred = credentials.Certificate("secret_key/eventthem-cdb38-firebase-adminsdk-a11er-623cb9668a.json")  # Replace with the path to your JSON credentials file
database_url = os.getenv("FIREBASE_DATABASE_URL")
storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET")

firebase_admin.initialize_app(cred, {
    'databaseURL': database_url,
    'storageBucket': storage_bucket
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
        psHandle = request.form['PSHandle']
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
        # Check if the name already exists in the database
        existing_user = user_ref.order_by_child('name').equal_to(name).limit_to_first(1).get()

        if existing_user:
            return jsonify({'error': 'Name already exists in the database'}), 400
     
        new_user_ref = user_ref.push({
            'name': name,
            'PSHandle': psHandle,
            'image_url': image_url
        })

        return jsonify({'success': True, 'message': 'User subscribed successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
    
@app.route('/delete_all_users', methods=['POST'])
def delete_participants():
    try:
        # Delete all users except "AddTeam"
        users_ref = db.reference('users')
        users = users_ref.get()
        if users:
            for user_key, user_data in users.items():
                if user_data.get('name') != "AddTeam":
                    users_ref.child(user_key).delete()

        # Get reference to the matches collection
        matches_ref = db.reference('matches')

        # Reset all matches to have scores [0, 0] and teams ["AddTeam", "AddTeam"]
        matches_snapshot = matches_ref.get()
        if matches_snapshot:
            for round_key, round_data in matches_snapshot.items():
                for match_key, match_data in round_data.items():
                    matches_ref.child(round_key).child(match_key).update({
                        'scores': [0, 0],
                        'teams': ["AddTeam", "AddTeam"]
                    })

        return jsonify({'success': True, 'message': 'Database reset successfully'})
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
        user_data = [{'name': user['name'],  'PSHandle': user['PSHandle'], 'image_url': user['image_url']} for user in users.values()]

        return jsonify({'success': True, 'users': user_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
    
@app.route('/get_all_users_name', methods=['GET'])
def get_all_name():
    try:
        # Retrieve all users from the Realtime Database
        user_ref = db.reference('users')  # Change 'users' to your desired node
        users = user_ref.get()

        # Extract names and images from users
        user_data = [{'name': user['name']} for user in users.values()]

        return jsonify({'success': True, 'users': user_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/update_match', methods=['POST'])
def update_match():
    try:
        # Get data from the request
        data = request.get_json()

        # Extract data from the request
        round_number = data.get('round')
        match_number = data.get('match')
        scores = data.get('scores')
        teams = data.get('teams')
        print(round_number, match_number, scores, teams)
        # Update the match data in the "matches" node in the Realtime Database
        match_ref = db.reference('matches').child(f'{round_number}').child(f'{match_number}')
        match_ref.update({
            'scores': scores,
            'teams': teams
        })

        return jsonify({'success': True, 'message': 'Match data updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
    
@app.route('/get_tournament_model', methods=['GET'])
def get_tournament_model():
    user_ref = db.reference('matches')  # Change 'users' to your desired node
    tournament_data = user_ref.get()
    print(tournament_data)
    try:
        return jsonify({'success': True, 'tournamentData': tournament_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/Match_Participants', methods=["POST"])
def get_matches():
    user_ref = db.reference('users')
    request_data = request.get_json()
    participants = request_data.get("participants", [])
    print(participants)

    participant_info = []

    for participant_name in participants:
        # Assuming there's a "name" property in the user document
        user_query = user_ref.order_by_child("name").equal_to(participant_name).get()

        if user_query:
            # Assuming there's only one user with a given name (adjust as needed)
            user_data = list(user_query.values())[0]

            # Check if required properties are present in user data
            name = user_data.get("name", "")
            image = user_data.get("image_url", "") if "image_url" in user_data else "default_image.jpg"
            pshandle = user_data.get("PSHandle", 0) if "PSHandle" in user_data else 0

            participant_info.append({
                "name": name,
                "image": image,
                "pshandle": pshandle,
            })
       

    return jsonify(participant_info)

@app.route('/current_setup', methods=["GET"])
def get_currentSetup():
    # Assuming 'setups' is the key where the current setup data is stored in Firebase
    setup_ref = db.reference('setups')
    current_setup = setup_ref.get()  # Retrieve the current setup data from Firebase
    print(current_setup)
    # Check if current_setup is not None
    if current_setup is not None:
        return jsonify(current_setup), 200
    else:
        return jsonify({'error': 'Current setup data not found'}), 404
    

@app.route('/set_current_setup', methods=["POST"])
def set_current_setup():
    try:
        # Get data from the request
        data = request.get_json()

        # Extract data from the request
        current_setup = data.get('current_setup')

        setup_ref = db.reference('setups')
        setup_ref.update({
            'current_setup': current_setup
        })
        return jsonify({'success': True, 'message': 'Match data updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


if __name__ == '__main__':
    app.run(debug=True)