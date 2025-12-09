from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
from datetime import datetime
import os

# Try to import Gemini, but continue if not available
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai not installed. AI features will use mock data.")

app = Flask(__name__)
CORS(app)

# Configure Gemini if available
if GEMINI_AVAILABLE and os.getenv('GEMINI_API_KEY'):
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
else:
    model = None
    print("Gemini API key not found. Using mock AI responses.")

# Mock Database
PRODUCTS = [
    {
        "product_code": "TSH-WHT-001",
        "name": "Basic White Tee",
        "category": "tshirt",
        "color": "White",
        "size": "M",
        "cost_price": 8.00,
        "selling_price": 19.99,
        "margin_percentage": 60.03
    },
    {
        "product_code": "TSH-BLK-001",
        "name": "Graphic Black Tee",
        "category": "tshirt",
        "color": "Black",
        "size": "L",
        "cost_price": 10.00,
        "selling_price": 24.99,
        "margin_percentage": 59.98
    },
    {
        "product_code": "TSH-GRY-001",
        "name": "Premium Grey Tee",
        "category": "tshirt",
        "color": "Grey",
        "size": "S",
        "cost_price": 14.00,
        "selling_price": 34.99,
        "margin_percentage": 59.99
    },
    {
        "product_code": "BAG-LTH-001",
        "name": "Premium Leather Tote",
        "category": "handbag",
        "color": "Cognac Brown",
        "size": "One Size",
        "cost_price": 65.00,
        "selling_price": 149.99,
        "margin_percentage": 56.67
    },
    {
        "product_code": "BAG-CRS-001",
        "name": "Crossbody Bag",
        "category": "handbag",
        "color": "Black",
        "size": "One Size",
        "cost_price": 45.00,
        "selling_price": 99.99,
        "margin_percentage": 54.99
    },
    {
        "product_code": "BAG-CLT-001",
        "name": "Evening Clutch",
        "category": "handbag",
        "color": "Gold",
        "size": "One Size",
        "cost_price": 35.00,
        "selling_price": 79.99,
        "margin_percentage": 56.25
    }
]

TEAM_MEMBERS = {
    "sarah": {
        "name": "Sarah",
        "role": "Visual Merchandiser",
        "email": "sarah@store.com",
        "tasks_completed": 0,
        "tasks_total": 0,
        "success_rate": 0
    },
    "mike": {
        "name": "Mike",
        "role": "Store Manager",
        "email": "mike@store.com",
        "tasks_completed": 0,
        "tasks_total": 0,
        "success_rate": 0
    },
    "alex": {
        "name": "Alex",
        "role": "Display Specialist",
        "email": "alex@store.com",
        "tasks_completed": 0,
        "tasks_total": 0,
        "success_rate": 0
    }
}

RECOMMENDATIONS = []

def generate_mock_weekly_sales():
    """Generate mock sales data for products"""
    sales_data = {}
    for product in PRODUCTS:
        code = product['product_code']
        weekly_sales = []
        for week in range(1, 13):
            base_units = 15 if product['category'] == 'tshirt' else 8
            units = random.randint(base_units-5, base_units+10)
            revenue = units * product['selling_price']
            profit = units * (product['selling_price'] - product['cost_price'])
            
            weekly_sales.append({
                "week_number": week,
                "units_sold": units,
                "revenue": round(revenue, 2),
                "profit": round(profit, 2),
                "stock_level": random.randint(5, 25)
            })
        sales_data[code] = weekly_sales
    return sales_data

WEEKLY_SALES = generate_mock_weekly_sales()

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard metrics"""
    total_sales = 0
    total_units = 0
    total_profit = 0
    
    category_performance = {
        'tshirts': {'revenue': 0, 'units': 0},
        'handbags': {'revenue': 0, 'units': 0}
    }
    
    for product in PRODUCTS:
        code = product['product_code']
        for week_data in WEEKLY_SALES[code]:
            total_sales += week_data['revenue']
            total_units += week_data['units_sold']
            total_profit += week_data['profit']
            
            cat_key = 'tshirts' if product['category'] == 'tshirt' else 'handbags'
            category_performance[cat_key]['revenue'] += week_data['revenue']
            category_performance[cat_key]['units'] += week_data['units_sold']
    
    # Calculate top performers
    top_performers = []
    for product in PRODUCTS:
        code = product['product_code']
        total_product_units = sum(w['units_sold'] for w in WEEKLY_SALES[code])
        total_product_revenue = sum(w['revenue'] for w in WEEKLY_SALES[code])
        top_performers.append({
            'product_code': code,
            'name': product['name'],
            'total_units': total_product_units,
            'total_revenue': round(total_product_revenue, 2)
        })
    
    top_performers.sort(key=lambda x: x['total_units'], reverse=True)
    
    # Low stock alerts
    low_stock = []
    for product in PRODUCTS:
        code = product['product_code']
        latest_stock = WEEKLY_SALES[code][-1]['stock_level']
        if latest_stock < 10:
            low_stock.append({
                'product_code': code,
                'name': product['name'],
                'current_stock': latest_stock,
                'avg_weekly_sales': sum(w['units_sold'] for w in WEEKLY_SALES[code]) // len(WEEKLY_SALES[code])
            })
    
    # Slow movers
    slow_movers = []
    for product in PRODUCTS:
        code = product['product_code']
        avg_weekly = sum(w['units_sold'] for w in WEEKLY_SALES[code]) / len(WEEKLY_SALES[code])
        if avg_weekly < 10:
            slow_movers.append({
                'product_code': code,
                'name': product['name'],
                'avg_weekly_sales': round(avg_weekly, 1),
                'weeks_below_threshold': 8
            })
    
    return jsonify({
        'metrics': {
            'total_sales': round(total_sales, 2),
            'total_units': total_units,
            'total_transactions': random.randint(400, 600),
            'total_profit': round(total_profit, 2)
        },
        'alerts': {
            'low_stock': low_stock,
            'slow_movers': slow_movers
        },
        'top_performers': top_performers,
        'category_performance': category_performance
    })

@app.route('/api/stock', methods=['GET'])
def get_stock():
    """Get all product stock data"""
    return jsonify({
        'products': PRODUCTS,
        'weekly_sales': WEEKLY_SALES
    })

@app.route('/api/insights/generate', methods=['POST'])
def generate_insights():
    """Generate AI insights for a product"""
    data = request.json
    product_code = data.get('product_code')
    time_period = data.get('time_period', 'all')
    
    product = next((p for p in PRODUCTS if p['product_code'] == product_code), None)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    # Get sales data
    weekly_data = WEEKLY_SALES[product_code]
    
    if model:
        try:
            prompt = f"""Analyze this fashion retail product's performance:

Product: {product['name']} ({product['category']})
Price: £{product['selling_price']}
Recent weekly sales: {[w['units_sold'] for w in weekly_data[-4:]]} units

Provide a detailed analysis (150 words) explaining:
- Performance trends
- Why patterns exist (seasonality, display location impact)
- Customer behavior insights
- Cross-selling opportunities

Then provide ONE specific merchandising recommendation.

Format as JSON:
{{
  "analysis": "detailed paragraph here",
  "recommendation": {{
    "action": "specific action",
    "reason": "why this will work"
  }}
}}
"""
            
            response = model.generate_content(prompt)
            result = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
            
            return jsonify({
                'insight': {
                    'product_code': product_code,
                    'product_name': product['name'],
                    'time_period': time_period,
                    'analysis': result['analysis'],
                    'recommendation': result['recommendation']
                }
            })
        except Exception as e:
            print(f"Gemini error: {e}")
            # Fall through to mock response
    
    # Mock response if Gemini not available
    mock_analysis = f"The {product['name']} shows {'strong' if product['category'] == 'tshirt' else 'steady'} performance with consistent weekly sales averaging {sum(w['units_sold'] for w in weekly_data[-4:])//4} units. As a {product['category']}, this item benefits from its versatile {product['color']} color option. Customer flow data suggests products positioned near the {'entrance' if random.random() > 0.5 else 'checkout area'} see 30% higher engagement. The {product['selling_price']} price point resonates well with our target demographic, maintaining healthy margins while remaining accessible. Seasonal trends indicate {'increasing' if random.random() > 0.5 else 'stable'} demand patterns that align with fashion calendar expectations."
    
    mock_recommendation = {
        "action": f"Position {product['name']} on featured display near store entrance" if product['category'] == 'tshirt' else f"Create premium section showcase for {product['name']} with complementary accessories",
        "reason": f"High-traffic entrance positioning increases visibility and capitalizes on impulse purchase behavior typical for {product['category']} items"
    }
    
    return jsonify({
        'insight': {
            'product_code': product_code,
            'product_name': product['name'],
            'time_period': time_period,
            'analysis': mock_analysis,
            'recommendation': mock_recommendation
        }
    })

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """Get all recommendations/tasks"""
    return jsonify({'recommendations': RECOMMENDATIONS})

@app.route('/api/recommendations/create', methods=['POST'])
def create_recommendation():
    """Create manual task"""
    data = request.json
    
    new_rec = {
        'id': f"task-{datetime.now().timestamp()}",
        'product_code': data.get('product_code'),
        'action': data['action'],
        'reason': data['reason'],
        'priority': data.get('priority', 'medium'),
        'status': 'pending',
        'assigned_to': None,
        'created_at': datetime.now().isoformat()
    }
    
    RECOMMENDATIONS.append(new_rec)
    return jsonify({'recommendation': new_rec})

@app.route('/api/recommendations/assign', methods=['POST'])
def assign_recommendation():
    """Assign task to team member"""
    data = request.json
    insight_id = data.get('insight_id')
    team_member = data.get('team_member')
    
    # If creating new from insight
    if 'action' in data:
        new_rec = {
            'id': insight_id or f"task-{datetime.now().timestamp()}",
            'product_code': data.get('product_code'),
            'action': data['action'],
            'reason': data['reason'],
            'priority': 'medium',
            'status': 'pending',
            'assigned_to': team_member,
            'created_at': datetime.now().isoformat()
        }
        RECOMMENDATIONS.append(new_rec)
        
        if team_member in TEAM_MEMBERS:
            TEAM_MEMBERS[team_member]['tasks_total'] += 1
        
        return jsonify({'success': True, 'recommendation': new_rec})
    
    # Updating existing
    rec = next((r for r in RECOMMENDATIONS if r['id'] == insight_id), None)
    if rec:
        old_member = rec['assigned_to']
        if old_member and old_member in TEAM_MEMBERS:
            TEAM_MEMBERS[old_member]['tasks_total'] -= 1
        
        rec['assigned_to'] = team_member
        if team_member in TEAM_MEMBERS:
            TEAM_MEMBERS[team_member]['tasks_total'] += 1
        
        return jsonify({'success': True})
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/recommendations/<task_id>/status', methods=['PUT'])
def update_task_status(task_id):
    """Update task status"""
    data = request.json
    new_status = data['status']
    
    rec = next((r for r in RECOMMENDATIONS if r['id'] == task_id), None)
    if not rec:
        return jsonify({'error': 'Task not found'}), 404
    
    old_status = rec['status']
    rec['status'] = new_status
    
    # Update team member stats
    if rec['assigned_to'] and rec['assigned_to'] in TEAM_MEMBERS:
        member = TEAM_MEMBERS[rec['assigned_to']]
        if new_status == 'completed' and old_status != 'completed':
            member['tasks_completed'] += 1
            if member['tasks_total'] > 0:
                member['success_rate'] = int((member['tasks_completed'] / member['tasks_total']) * 100)
    
    return jsonify({'success': True})

@app.route('/api/team/members', methods=['GET'])
def get_team_members():
    """Get all team members"""
    return jsonify({'team_members': TEAM_MEMBERS})

@app.route('/api/team/<member_id>/tasks', methods=['GET'])
def get_member_tasks(member_id):
    """Get tasks for specific member"""
    tasks = [r for r in RECOMMENDATIONS if r.get('assigned_to') == member_id]
    return jsonify({'tasks': tasks})

@app.route('/api/team/action-plan', methods=['POST'])
def get_action_plan():
    """Generate action plan for task"""
    data = request.json
    recommendation = data['recommendation']
    
    if model:
        try:
            prompt = f"""Generate a detailed action plan for this task:

Task: {recommendation['action']}
Reason: {recommendation['reason']}

Provide a JSON response with:
- steps: array of 8-10 detailed step-by-step instructions
- tools_needed: array of 5-7 tools/equipment needed
- safety_notes: array of 4-5 safety considerations
- estimated_time: string like "45-60 minutes"

Focus on fashion retail context (moving displays, arranging products, styling).
"""
            
            response = model.generate_content(prompt)
            result = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
            return jsonify({'action_plan': result})
        except Exception as e:
            print(f"Gemini error: {e}")
    
    # Mock action plan
    mock_plan = {
        "steps": [
            "Clear the designated area and ensure it's clean and ready",
            "Gather all products that will be featured in the display",
            "Arrange products by color and style for visual appeal",
            "Position key items at eye level for maximum visibility",
            "Add complementary accessories to complete the look",
            "Adjust lighting to highlight featured products",
            "Create clear pricing labels and place them appropriately",
            "Take photos of the final display for documentation",
            "Brief team members on the new layout",
            "Monitor customer engagement for first 48 hours"
        ],
        "tools_needed": [
            "Step ladder for reaching high displays",
            "Clothing steamer for product preparation",
            "Price tag holders and labels",
            "Display mannequins or hangers",
            "Cleaning supplies for surfaces",
            "Camera or smartphone for documentation",
            "Measuring tape for spacing"
        ],
        "safety_notes": [
            "Use step ladder safely with someone spotting you",
            "Keep walkways clear to prevent tripping hazards",
            "Handle products carefully to avoid damage",
            "Ensure displays are stable and won't fall",
            "Follow lifting techniques to prevent back strain"
        ],
        "estimated_time": "45-60 minutes"
    }
    
    return jsonify({'action_plan': mock_plan})

# Store layout data in memory (in production, use database)
STORE_LAYOUTS = []

@app.route('/api/layout/update', methods=['POST'])
def update_layout_object():
    """Update 2D layout object position and sync with Omniverse"""
    data = request.json
    object_id = data.get('object_id')
    canvas_x = data.get('x')
    canvas_y = data.get('y')
    rotation = data.get('rotation', 0)
    
    # Convert 2D canvas coordinates to 3D world coordinates
    # Canvas: 0-800px (width), 0-600px (height)
    # World: -10 to +10 meters in X and Z
    def canvas_to_world(canvas_x, canvas_y):
        scale_x = 20 / 800  # 20m / 800px
        scale_z = 15 / 600  # 15m / 600px
        world_x = (canvas_x - 400) * scale_x
        world_z = (canvas_y - 300) * scale_z
        return (world_x, 0.0, world_z)  # Y=0 (floor level)
    
    world_x, world_y, world_z = canvas_to_world(canvas_x, canvas_y)
    
    # TODO: Connect to Omniverse USD and update transform
    # Example pseudocode:
    # import omni.usd
    # stage = omni.usd.get_context().get_stage()
    # prim = stage.GetPrimAtPath(f"/World/Store/{object_id}")
    # if prim:
    #     xform = UsdGeom.Xformable(prim)
    #     xform.ClearXformOpOrder()
    #     xform.AddTranslateOp().Set(Gf.Vec3d(world_x, world_y, world_z))
    #     xform.AddRotateYOp().Set(rotation)
    
    print(f"Layout update: {object_id} -> Canvas({canvas_x}, {canvas_y}) -> World({world_x:.2f}, {world_y:.2f}, {world_z:.2f}), Rotation: {rotation}°")
    
    return jsonify({
        'success': True,
        'object_id': object_id,
        'world_position': {
            'x': world_x,
            'y': world_y,
            'z': world_z
        },
        'rotation': rotation,
        'message': 'Layout updated and synced with Omniverse'
    })

@app.route('/api/layout/save', methods=['POST'])
def save_layout():
    """Save complete store layout"""
    data = request.json
    layout = data.get('layout', [])
    timestamp = data.get('timestamp')
    name = data.get('name', f"Layout {len(STORE_LAYOUTS) + 1}")
    
    layout_data = {
        'id': f"layout-{datetime.now().timestamp()}",
        'name': name,
        'timestamp': timestamp,
        'objects': layout
    }
    
    STORE_LAYOUTS.append(layout_data)
    
    # TODO: Save to database and push to Omniverse
    print(f"Saved layout '{name}' with {len(layout)} objects")
    
    return jsonify({
        'success': True,
        'layout_id': layout_data['id'],
        'message': f'Layout "{name}" saved successfully'
    })

@app.route('/api/layout/load', methods=['GET'])
def load_layouts():
    """Load all saved layouts"""
    return jsonify({
        'layouts': STORE_LAYOUTS
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
