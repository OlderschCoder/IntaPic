import os
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from config import Config
import resend
from twilio.rest import Client as TwilioClient

app = Flask(__name__, static_folder='static', static_url_path='')
app.config.from_object(Config)
CORS(app)

resend.api_key = app.config['RESEND_API_KEY']

twilio_client = None
account_sid = app.config['TWILIO_ACCOUNT_SID']
auth_token = app.config['TWILIO_AUTH_TOKEN']
if account_sid and account_sid.startswith('AC') and auth_token:
    twilio_client = TwilioClient(account_sid, auth_token)
    print("Twilio client initialized successfully")
else:
    print("Twilio credentials not configured or invalid (Account SID must start with 'AC')")


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/send-photos', methods=['POST'])
def send_photos():
    try:
        data = request.get_json()
        email = data.get('email')
        photo_strip = data.get('photoStrip')
        session_id = data.get('sessionId', 'N/A')
        
        if not email or not photo_strip:
            return jsonify({'error': 'Email and photo strip are required'}), 400
        
        import base64
        base64_data = photo_strip.split(',')[1] if ',' in photo_strip else photo_strip
        
        from datetime import datetime
        
        params = {
            "from": app.config['EMAIL_FROM'],
            "to": [email],
            "subject": "Your Photo Strip from Billy's Ayr Lanes! 📸",
            "html": f"""
                <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #f5f5f5; padding: 40px;">
                    <div style="text-align: center; border-bottom: 2px solid #fbbf24; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="color: #fbbf24; font-size: 28px; margin: 0;">BILLY'S AYR LANES</h1>
                        <p style="color: #888; font-size: 12px; margin-top: 10px;">PHOTO-MATIC 2000</p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #fff; font-size: 20px;">Thanks for visiting our booth!</h2>
                        <p style="color: #aaa; font-size: 14px;">Your photo strip is attached below. Save it, share it, and come back soon!</p>
                    </div>
                    
                    <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                        <p style="color: #666; font-size: 11px; margin: 0;">Session ID: {session_id}</p>
                        <p style="color: #666; font-size: 11px; margin: 5px 0 0 0;">{datetime.now().strftime('%m/%d/%Y')}</p>
                    </div>
                    
                    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #333;">
                        <p style="color: #666; font-size: 10px;">Billy's Ayr Lanes • Photo Booth Experience</p>
                    </div>
                </div>
            """,
            "attachments": [
                {
                    "filename": f"photobooth-{session_id}.jpg",
                    "content": base64_data,
                }
            ]
        }
        
        response = resend.Emails.send(params)
        
        return jsonify({'success': True, 'messageId': response.get('id')})
    
    except Exception as e:
        print(f"Email send error: {e}")
        return jsonify({'error': 'Failed to send email', 'details': str(e)}), 500


@app.route('/api/send-sms', methods=['POST'])
def send_sms():
    try:
        if not twilio_client:
            return jsonify({
                'error': 'SMS not configured',
                'details': "Twilio credentials are not set up. Please configure TWILIO_ACCOUNT_SID (must start with 'AC'), TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER."
            }), 503
        
        data = request.get_json()
        phone = data.get('phone')
        photo_url = data.get('photoUrl')
        session_id = data.get('sessionId')
        
        if not phone or not photo_url:
            return jsonify({'error': 'Phone number and photo URL are required'}), 400
        
        import re
        formatted_phone = re.sub(r'\D', '', phone)
        if not formatted_phone.startswith('1') and len(formatted_phone) == 10:
            formatted_phone = '1' + formatted_phone
        formatted_phone = '+' + formatted_phone
        
        message = twilio_client.messages.create(
            body="Thanks for visiting Billy's Ayr Lanes Photo Booth! 📸 Your photo strip is attached. Come back soon!",
            from_=app.config['TWILIO_PHONE_NUMBER'],
            to=formatted_phone,
            media_url=[photo_url]
        )
        
        return jsonify({'success': True, 'messageSid': message.sid})
    
    except Exception as e:
        print(f"SMS send error: {e}")
        return jsonify({'error': 'Failed to send SMS', 'details': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'email_configured': bool(app.config['RESEND_API_KEY']),
        'sms_configured': twilio_client is not None
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
