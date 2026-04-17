# app.py — Sanskriti Sphere Backend
# Run: python app.py  →  http://127.0.0.1:5000

from flask import Flask, render_template, jsonify, request, send_from_directory
from pathlib import Path
import json, random, datetime

app = Flask(__name__, template_folder='templates', static_folder='static')

# ─────────────────────────────────────────────
#  MONUMENT DATA
# ─────────────────────────────────────────────
MONUMENTS = {
    "taj": {
        "id": "taj",
        "name": "Taj Mahal",
        "location": "Agra, Uttar Pradesh",
        "era": "Mughal Era · 1632 AD",
        "period": "1632–1653 AD",
        "style": "Mughal",
        "rating": 4.9,
        "reviews": 12400,
        "badge": "360° VR",
        "description": (
            "The world's most iconic monument of love — an ethereal marble mausoleum "
            "built by Emperor Shah Jahan for his beloved Mumtaz Mahal. A UNESCO World "
            "Heritage Site and symbol of Mughal artistry at its peak."
        ),
        "story": (
            "Emperor Shah Jahan built the Taj Mahal between 1632 and 1653 as an eternal tribute "
            "to his wife Mumtaz Mahal who died in 1631. Over 20,000 artisans worked on this wonder. "
            "The white Makrana marble features 28 types of precious stones inlaid in intricate floral "
            "patterns (pietra dura). The Charbagh gardens symbolise the four rivers of paradise in "
            "Islamic tradition. At dawn the marble glows pink; at noon it is dazzling white; "
            "in the evening it turns golden. It took 22 years and 32 million rupees to complete."
        ),
        "tags": ["Mughal", "UNESCO", "Marble Inlay", "360° VR"],
        "hotspots": {
            "Main Mausoleum": {
                "icon": "🕌",
                "coords": {"x": 0.50, "y": 0.38},
                "title": "Main Mausoleum",
                "text": (
                    "The central domed structure contains the cenotaphs of Mumtaz Mahal and Shah Jahan. "
                    "The actual graves lie directly below in a plainer chamber. Interior walls are decorated "
                    "with Quranic inscriptions and pietra dura inlay of extraordinary delicacy. "
                    "The main dome is 73 metres high and is surrounded by four smaller chattri domes."
                )
            },
            "Charbagh Gardens": {
                "icon": "🌿",
                "coords": {"x": 0.50, "y": 0.75},
                "title": "Charbagh Gardens",
                "text": (
                    "The 300m × 300m garden is divided into four quadrants by raised marble waterways. "
                    "16 flowerbeds with 400 plants each were originally planted. The central pool perfectly "
                    "reflects the Taj Mahal — considered one of the most photographed reflections in the world. "
                    "The garden symbolises paradise in Islamic tradition."
                )
            },
            "Mosque & Jawab": {
                "icon": "🕍",
                "coords": {"x": 0.22, "y": 0.42},
                "title": "Mosque & Jawab",
                "text": (
                    "Two identical red sandstone buildings flank the Taj. The western one is a functioning mosque. "
                    "The eastern (Jawab) was built purely for symmetry — it cannot be used as a mosque because "
                    "it does not face Mecca. Each building is 56.7 metres long."
                )
            },
            "Minarets": {
                "icon": "🗼",
                "coords": {"x": 0.28, "y": 0.28},
                "title": "Four Minarets",
                "text": (
                    "The four minarets stand 40 metres tall and tilt very slightly outward — so that if they "
                    "fall during an earthquake, they fall away from the main tomb. Each minaret has three "
                    "balconies. The lean is barely perceptible but was a deliberate engineering decision."
                )
            },
            "Pietra Dura Inlay": {
                "icon": "💎",
                "coords": {"x": 0.68, "y": 0.35},
                "title": "Pietra Dura Inlay",
                "text": (
                    "Over one million precious stones — lapis lazuli from Afghanistan, turquoise from Tibet, "
                    "jade from China, sapphires from Sri Lanka — were inlaid by the finest craftsmen of the "
                    "Mughal Empire. Each flower petal is a single cut stone. Under ultraviolet light, "
                    "the inlay glows with unexpected colours."
                )
            }
        }
    },
    "khajuraho": {
        "id": "khajuraho",
        "name": "Khajuraho Temples",
        "location": "Madhya Pradesh",
        "era": "Chandela · 950 AD",
        "period": "950–1050 AD",
        "style": "Nagara",
        "rating": 4.8,
        "reviews": 8200,
        "badge": "AR Scan",
        "description": (
            "Magnificent medieval temples adorned with exquisite Nagara-style architecture and sculptures "
            "depicting life in all its dimensions. Of the original 85 temples, 25 survive."
        ),
        "story": (
            "The Khajuraho temples were built by the Chandela dynasty between 950 and 1050 CE. "
            "Of the original 85 temples, 25 survive spread over 20 sq km. They are famous for their "
            "Nagara-style shikhara towers and erotic sculptures — but these represent only ~10% of the "
            "total artwork. The remaining 90% depict gods, apsaras, warriors, and daily life. "
            "The temples align astronomically with cardinal directions and are built from warm sandstone "
            "that glows honey-gold at sunset."
        ),
        "tags": ["Nagara Style", "UNESCO", "Medieval", "Sculpture"],
        "hotspots": {
            "Kandariya Mahadeva": {
                "icon": "🛕",
                "coords": {"x": 0.50, "y": 0.30},
                "title": "Kandariya Mahadeva Temple",
                "text": (
                    "The largest and finest temple, dedicated to Shiva. Its shikhara soars 31 metres "
                    "with over 800 sculptures arranged in horizontal bands. The sculptures show a "
                    "sophisticated understanding of human anatomy unmatched in Indian art of the period."
                )
            },
            "Apsara Carvings": {
                "icon": "🌸",
                "coords": {"x": 0.75, "y": 0.50},
                "title": "Apsara & Surasundari Carvings",
                "text": (
                    "The graceful celestial maidens depicted writing letters, applying makeup, playing music, "
                    "and dancing represent the ideal of feminine beauty. Art historians note they show genuine "
                    "portraiture — not generic ideals. They were carved by different masters over generations."
                )
            },
            "Star-shaped Plinth": {
                "icon": "⭐",
                "coords": {"x": 0.50, "y": 0.82},
                "title": "Star-shaped Plinth (Jagati)",
                "text": (
                    "The star-shaped platform (panchayatana) creates a complex interplay of shadow and light "
                    "at different times of day. The geometry was calculated to dramatise the vertical thrust "
                    "of the shikhara towers above. The stairs are oriented to the cardinal directions."
                )
            },
            "Shiva Sanctum": {
                "icon": "🔱",
                "coords": {"x": 0.30, "y": 0.45},
                "title": "Garbhagriha — Inner Sanctum",
                "text": (
                    "The inner sanctum (garbhagriha) houses a massive Shiva lingam. The circumambulatory "
                    "path (pradakshina) allows worshippers to walk around it. Stone screens filter light "
                    "creating a meditative interior atmosphere of extraordinary stillness."
                )
            },
            "Erotic Sculptures": {
                "icon": "🎭",
                "coords": {"x": 0.20, "y": 0.60},
                "title": "Mithuna Sculptures",
                "text": (
                    "Scholars debate their meaning — divine union, Tantric philosophy, worldly pleasures "
                    "to be left behind on entering the temple, or depictions of the 64 yoginis. "
                    "What is certain: they represent the work of masters at the absolute height of their craft. "
                    "Each figure is unique — no two are identical across the entire complex."
                )
            }
        }
    },
    "hampi": {
        "id": "hampi",
        "name": "Hampi Ruins",
        "location": "Karnataka",
        "era": "Vijayanagara · 1336 AD",
        "period": "14th–16th CE",
        "style": "Vijayanagara",
        "rating": 4.7,
        "reviews": 6800,
        "badge": "3D Walk",
        "description": (
            "The last capital of the great Vijayanagara Empire — a surreal landscape of giant granite "
            "boulders and magnificent ruins. Once the second-largest city in the world."
        ),
        "story": (
            "Hampi was the capital of the Vijayanagara Empire — at its peak in the 16th century the second-largest "
            "city in the world after Beijing with over 500,000 inhabitants across 650 sq km. Portuguese and Persian "
            "travellers described it as surpassing Rome in wealth and beauty. In 1565, after the Battle of Talikota, "
            "invading sultans sacked and burned the city for six months. What remains is a UNESCO World Heritage "
            "Site of haunting beauty — 1,600 surviving monuments among otherworldly granite boulder landscapes."
        ),
        "tags": ["Dravidian", "UNESCO", "Ruins", "Vijayanagara"],
        "hotspots": {
            "Virupaksha Temple": {
                "icon": "🏛️",
                "coords": {"x": 0.30, "y": 0.40},
                "title": "Virupaksha Temple",
                "text": (
                    "The only temple still in active worship at Hampi, dedicated to Lord Virupaksha (Shiva). "
                    "Its gopuram is 50 metres tall. An elephant named Lakshmi lives here and blesses visitors. "
                    "The temple has been continuously functioning for over 1,000 years."
                )
            },
            "Elephant Stables": {
                "icon": "🐘",
                "coords": {"x": 0.65, "y": 0.55},
                "title": "Royal Elephant Stables",
                "text": (
                    "Eleven chambers in alternating Indo-Islamic style housed the royal war elephants. "
                    "The largest chamber has a domed ceiling. The stables reflect the cosmopolitan architectural "
                    "taste of Vijayanagara, blending Hindu and Islamic styles seamlessly."
                )
            },
            "Lotus Mahal": {
                "icon": "🏰",
                "coords": {"x": 0.70, "y": 0.35},
                "title": "Lotus Mahal Palace",
                "text": (
                    "An exquisite palace pavilion with arched niches resembling a lotus bud in plan. "
                    "Built for the royal women of the palace, it combines Dravidian and Islamic elements. "
                    "The name is a colonial-era invention — the original name is unknown."
                )
            },
            "Boulder Valley": {
                "icon": "🪨",
                "coords": {"x": 0.20, "y": 0.60},
                "title": "Ancient Boulder Landscape",
                "text": (
                    "The surreal granite inselbergs surrounding Hampi are among the oldest rock formations "
                    "on Earth — over 2.5 billion years old. Boulders were used as natural fortifications, "
                    "and cave hermitages and shrines are carved into them throughout the landscape."
                )
            },
            "River Crossing": {
                "icon": "⛵",
                "coords": {"x": 0.50, "y": 0.80},
                "title": "Tungabhadra River",
                "text": (
                    "The Tungabhadra river was crossed by coracle boats — circular wicker boats covered in "
                    "buffalo hide still used today. The river was sacred and formed the northern boundary "
                    "of the royal capital. Several royal bathing ghats line the riverbank."
                )
            }
        }
    },
    "ajanta": {
        "id": "ajanta",
        "name": "Ajanta Caves",
        "location": "Maharashtra",
        "era": "2nd BCE – 6th CE",
        "period": "200 BCE – 480 CE",
        "style": "Buddhist",
        "rating": 4.9,
        "reviews": 9100,
        "badge": "Cave Explorer",
        "description": (
            "Rock-cut Buddhist caves housing the finest ancient Indian paintings and sculptures, "
            "rediscovered in 1819 after 1,300 years of jungle isolation."
        ),
        "story": (
            "The 30 Ajanta Caves were excavated over eight centuries from 2nd BCE to 480 CE by Buddhist "
            "monks and royal patrons. Rediscovered in 1819 by a British officer on a tiger hunt, they contain "
            "the finest surviving examples of ancient Indian painting and sculpture. The paintings — depicting "
            "Jataka tales and the life of the Buddha — used mineral pigments on wet plaster (true fresco). "
            "The site was abandoned after the decline of Gupta-era Buddhism and sealed by jungle for 1,300 years. "
            "Their isolation is precisely why the paintings survived so remarkably."
        ),
        "tags": ["Buddhist", "UNESCO", "Rock-cut", "Frescoes"],
        "hotspots": {
            "Cave 1 Paintings": {
                "icon": "🖼️",
                "coords": {"x": 0.40, "y": 0.45},
                "title": "Cave 1 — Bodhisattva Padmapani",
                "text": (
                    "Cave 1 contains the most celebrated paintings, including the Bodhisattva Padmapani — "
                    "a figure of extraordinary serenity holding a lotus. Art historians consider it equal "
                    "to the finest works of any civilisation. The blue pigment used was lapis lazuli "
                    "ground to powder, imported from Afghanistan along ancient trade routes."
                )
            },
            "Meditation Hall": {
                "icon": "🧘",
                "coords": {"x": 0.60, "y": 0.35},
                "title": "Chaitya Hall & Vihara",
                "text": (
                    "The chaitya halls (prayer halls) have apsidal ends with a stupa at the far end. "
                    "The monks' cells (viharas) open onto a central courtyard. Each cave was a "
                    "self-contained monastery — the monks slept, ate, prayed, and painted "
                    "without leaving their cave complex."
                )
            },
            "Jataka Murals": {
                "icon": "🦁",
                "coords": {"x": 0.25, "y": 0.55},
                "title": "Jataka Tale Murals",
                "text": (
                    "The Jataka murals illustrate the 547 past lives of the Buddha — as a deer, an elephant, "
                    "a merchant, a king. They function as visual scripture for mostly illiterate worshippers. "
                    "The narrative panels are read right to left, matching Sanskrit manuscript convention. "
                    "Some scenes show crowds of hundreds of detailed individual figures."
                )
            },
            "River Gorge View": {
                "icon": "🌊",
                "coords": {"x": 0.75, "y": 0.70},
                "title": "Waghora River Gorge",
                "text": (
                    "The horseshoe-shaped gorge above the Waghora river creates natural acoustics — "
                    "a bell struck in one cave can be heard in caves 300 metres away. The monks chose "
                    "this location deliberately for its contemplative silence and the sound of running water."
                )
            },
            "Excavation Points": {
                "icon": "⛏️",
                "coords": {"x": 0.55, "y": 0.70},
                "title": "Rock-cut Excavation",
                "text": (
                    "The rock-cut technique required quarrying from top to bottom — ceiling first, then walls, "
                    "then floor. A single mistake would destroy months of work. Modern engineers marvel at "
                    "how the monks achieved precise verticals and horizontals without modern instruments. "
                    "An estimated 200 tonnes of rock was removed per cave."
                )
            }
        }
    }
}

QUIZ_QUESTIONS = [
    {
        "q": "Which emperor commissioned the Taj Mahal and in which year did construction begin?",
        "opts": ["Akbar, 1556", "Shah Jahan, 1632", "Aurangzeb, 1658", "Humayun, 1540"],
        "ans": 1,
        "exp": "Shah Jahan began construction in 1632 as a mausoleum for his wife Mumtaz Mahal who died in 1631."
    },
    {
        "q": "The Khajuraho temples were built by which Rajput dynasty?",
        "opts": ["Paramara", "Chandela", "Solanki", "Chahamana"],
        "ans": 1,
        "exp": "The Chandela dynasty built the Khajuraho temples between 950 and 1050 CE."
    },
    {
        "q": "The Vijayanagara Empire's capital at Hampi was sacked after which battle?",
        "opts": ["Battle of Panipat", "Battle of Haldighati", "Battle of Talikota", "Battle of Plassey"],
        "ans": 2,
        "exp": "The Battle of Talikota in 1565 ended the Vijayanagara Empire when a coalition of Deccan Sultanates defeated and sacked the city."
    },
    {
        "q": "The Ajanta Caves were rediscovered in which year?",
        "opts": ["1756", "1819", "1902", "1947"],
        "ans": 1,
        "exp": "A British officer named John Smith rediscovered the Ajanta Caves in 1819 during a tiger hunt."
    },
    {
        "q": "Which architectural style characterises the Khajuraho temples?",
        "opts": ["Dravidian", "Vesara", "Nagara", "Kalinga"],
        "ans": 2,
        "exp": "Khajuraho temples are built in the Nagara style — characterised by a beehive-shaped tower (shikhara)."
    },
    {
        "q": "How many types of precious stones are inlaid in the Taj Mahal's pietra dura work?",
        "opts": ["12", "18", "28", "42"],
        "ans": 2,
        "exp": "28 types of precious and semi-precious stones from across Asia were used in the Taj Mahal's inlay work."
    },
    {
        "q": "At its peak, Hampi was the second-largest city in the world after which city?",
        "opts": ["Rome", "Constantinople", "Beijing", "Cairo"],
        "ans": 2,
        "exp": "At its peak in the 16th century, Hampi was the second-largest city in the world after Beijing."
    },
    {
        "q": "The Charbagh garden of the Taj Mahal is divided into how many quadrants?",
        "opts": ["2", "4", "8", "12"],
        "ans": 1,
        "exp": "The Charbagh (meaning 'four gardens') is divided into four quadrants by raised marble waterways."
    }
]

LEADERBOARD = [
    {"rank": 1, "name": "Arjun Sharma", "avatar": "🏛️", "score": 9840, "badge": "Scholar"},
    {"rank": 2, "name": "Priya Nair",   "avatar": "👸", "score": 9210, "badge": "Rani"},
    {"rank": 3, "name": "Rohan Verma",  "avatar": "🧘", "score": 8750, "badge": "Sage"},
    {"rank": 4, "name": "Meera Iyer",   "avatar": "⚔️", "score": 7990, "badge": None},
    {"rank": 5, "name": "Dev Patel",    "avatar": "🎭", "score": 7430, "badge": None},
]

AVATARS = [
    {"id": "scholar",   "emoji": "🏛️", "name": "The Scholar",   "story": "A learned pandit from ancient Nalanda, keeper of sacred texts and seeker of cosmic truths. Your journey through heritage is guided by curiosity and reverence for knowledge."},
    {"id": "warrior",   "emoji": "⚔️", "name": "The Warrior",   "story": "A valiant kshatriya who defended the great kingdoms of the Deccan. Every monument is a strategic fortress and every sculpture a warrior's prayer."},
    {"id": "artist",    "emoji": "🎭", "name": "The Artist",    "story": "A master sculptor from the Hoysala court, whose hands have carved gods from living stone. Beauty in heritage speaks to you in ways words cannot."},
    {"id": "sage",      "emoji": "🧘", "name": "The Sage",      "story": "A wandering ascetic who has walked from the Himalayas to Kanyakumari. Every sacred site holds a memory of your past journeys."},
    {"id": "rani",      "emoji": "👸", "name": "The Rani",      "story": "A queen of the Maratha confederacy, fierce and cultured in equal measure. Royal courts and palace architecture are your natural home."},
    {"id": "musician",  "emoji": "🪘", "name": "The Musician",  "story": "A court musician from the Vijayanagara Empire, fluent in Carnatic ragas and the language of temple bells. Culture lives in sound for you."},
    {"id": "vaidya",    "emoji": "🌿", "name": "The Vaidya",    "story": "An Ayurvedic healer whose knowledge of plants was recorded on copper plates at Nalanda. Heritage for you is living wisdom."},
    {"id": "navigator", "emoji": "⚓", "name": "The Navigator", "story": "A Chola sailor who charted trade routes to Java and Cambodia. Every monument carries the memory of exchange and exploration."},
]

# ─────────────────────────────────────────────
#  ROUTES
# ─────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('sanskriti.html')

# All monuments
@app.route('/api/monuments')
def api_monuments():
    data = []
    for m in MONUMENTS.values():
        data.append({k: v for k, v in m.items() if k != 'hotspots'})
    return jsonify({'monuments': data})

# Single monument detail
@app.route('/api/monument/<mid>')
def api_monument(mid):
    m = MONUMENTS.get(mid)
    if not m:
        return jsonify({'error': 'Monument not found'}), 404
    return jsonify(m)

# Hotspot detail
@app.route('/api/monument/<mid>/hotspot/<hid>')
def api_hotspot(mid, hid):
    m = MONUMENTS.get(mid)
    if not m:
        return jsonify({'error': 'Monument not found'}), 404
    hs = m['hotspots'].get(hid)
    if not hs:
        return jsonify({'error': 'Hotspot not found'}), 404
    return jsonify(hs)

# All hotspots for a monument
@app.route('/api/monument/<mid>/hotspots')
def api_hotspots(mid):
    m = MONUMENTS.get(mid)
    if not m:
        return jsonify({'error': 'Monument not found'}), 404
    return jsonify({'hotspots': m['hotspots']})

# Quiz questions
@app.route('/api/quiz')
def api_quiz():
    count = int(request.args.get('count', 5))
    q = random.sample(QUIZ_QUESTIONS, min(count, len(QUIZ_QUESTIONS)))
    return jsonify({'questions': q})

# Submit quiz answer (server-side validation)
@app.route('/api/quiz/check', methods=['POST'])
def api_quiz_check():
    data = request.get_json(force=True)
    qi   = data.get('question_index', -1)
    ans  = data.get('answer', -1)
    if qi < 0 or qi >= len(QUIZ_QUESTIONS):
        return jsonify({'error': 'Invalid question index'}), 400
    q = QUIZ_QUESTIONS[qi]
    correct = (ans == q['ans'])
    return jsonify({
        'correct':     correct,
        'correct_ans': q['ans'],
        'explanation': q['exp'],
        'points':      100 if correct else 0
    })

# Leaderboard
@app.route('/api/leaderboard')
def api_leaderboard():
    return jsonify({'leaderboard': LEADERBOARD})

# Avatars
@app.route('/api/avatars')
def api_avatars():
    return jsonify({'avatars': AVATARS})

# Virtual tour metadata (aerial/walk waypoints)
@app.route('/api/tour/<mid>')
def api_tour(mid):
    m = MONUMENTS.get(mid)
    if not m:
        return jsonify({'error': 'Monument not found'}), 404

    modes = {
        'walk': {
            'label': '🚶 Walking Tour',
            'desc':  'Navigate through the monument on foot. Explore every corner at ground level.',
            'waypoints': ['Entrance Gate', 'Main Courtyard', 'Central Structure', 'Side Galleries', 'Exit Viewpoint']
        },
        'fly': {
            'label': '🦅 Aerial View',
            'desc':  'Soar above the monument for a bird\'s-eye perspective of its full scale and layout.',
            'altitude': '200m',
            'waypoints': ['Overhead North', 'Overhead East', 'Overhead South', 'Overhead West', 'Zenith View']
        },
        'story': {
            'label': '📖 Story Mode',
            'desc':  'AI historian narrates the full history with dramatic re-enactments.',
            'duration': '12 min'
        },
        'ar': {
            'label': '📱 AR Overlay',
            'desc':  'Augmented Reality mode — overlays architectural details, dates, and annotations.',
            'layers': ['Architecture', 'History', 'Art', 'Science']
        },
        'night': {
            'label': '🌙 Night Experience',
            'desc':  'Experience the monument under moonlight as ancient visitors would have seen it.',
            'time': '21:00 IST'
        }
    }

    return jsonify({
        'monument': {k: v for k, v in m.items() if k != 'hotspots'},
        'hotspots': m['hotspots'],
        'modes': modes
    })

# Health check
@app.route('/api/health')
def health():
    return jsonify({
        'status':    'ok',
        'version':   '2.0',
        'monuments': len(MONUMENTS),
        'timestamp': datetime.datetime.utcnow().isoformat()
    })

# ─────────────────────────────────────────────
if __name__ == '__main__':
    # Create template/static folders if missing
    Path('templates').mkdir(exist_ok=True)
    Path('static/css').mkdir(parents=True, exist_ok=True)
    Path('static/js').mkdir(parents=True, exist_ok=True)
    print("\n🛕  Sanskriti Sphere running at  http://127.0.0.1:5000\n")
    app.run(debug=True, host='127.0.0.1', port=5000)