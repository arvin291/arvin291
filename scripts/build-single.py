# Builds one shareable HTML file with inlined CSS, JS, logo and flyer.
from pathlib import Path
import base64
from io import BytesIO
from PIL import Image

root = Path(__file__).resolve().parents[1]
css = (root / "assets" / "css" / "site.css").read_text(encoding="utf-8")
css += """
.view{display:none}
.view.is-on{display:block}
.flyer{width:100%;border:1px solid var(--line)}
.hero-mark img{width:100%;height:auto}
"""

def data_uri(path, max_w=None, quality=82):
    img = Image.open(path).convert("RGBA") if path.suffix.lower() == ".png" else Image.open(path).convert("RGB")
    if max_w and img.width > max_w:
        h = int(img.height * max_w / img.width)
        img = img.resize((max_w, h), Image.Resampling.LANCZOS)
    buf = BytesIO()
    if path.suffix.lower() == ".png":
        img.save(buf, "PNG", optimize=True)
        mime = "image/png"
    else:
        img.save(buf, "JPEG", quality=quality, optimize=True)
        mime = "image/jpeg"
    return "data:%s;base64,%s" % (mime, base64.b64encode(buf.getvalue()).decode("ascii"))

logo = data_uri(root / "assets" / "img" / "logo.png", 480)
flyer = data_uri(root / "assets" / "img" / "profile-flyer.jpeg", 900, 78)

def cap_img(name, size=72, cls="cap-logo"):
    uri = data_uri(root / "assets" / "img" / "caps" / (name + ".png"), 192)
    return '<img class="%s" src="%s" width="%d" height="%d" alt="">' % (cls, uri, size, size)

def cat_mark(name):
    return cap_img(name, 28, "cat-mark")

desk_js = (root / "assets" / "js" / "desk.js").read_text(encoding="utf-8")
social_js = (root / "assets" / "js" / "social.js").read_text(encoding="utf-8")

html = r'''<!doctype html>
<html lang="en-IN" data-single="1" data-logo="LOGO_URI">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Shalvi Technologies · Lucknow</title>
<meta name="description" content="IT, security, AV, websites, civic programmes, cyber security software, forensic systems and drones from Lucknow. Specify, supply, support.">
<link rel="icon" href="LOGO_URI">
<link rel="stylesheet" href="https://fonts.bunny.net/css?family=fraunces:500,560,600,700|inter-tight:400,600,700&display=swap">
<style>
CSS_HERE
</style>
</head>
<body class="is-home">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header" id="header">
  <div class="topbar"><div class="wrap topbar-in">
    <span><span class="gem">GeM</span> listed · Lucknow</span>
    <span>
      <a href="tel:+916307057085">+91 63070 57085</a> ·
      <a href="tel:+919794980001">+91 97949 80001</a> ·
      <a href="mailto:info@shalvitechnologies.com">info@shalvitechnologies.com</a>
    </span>
  </div></div>
  <div class="wrap nav">
    <a class="brand" href="#home" data-go="home">
      <img src="LOGO_URI" alt="Shalvi Technologies emblem" width="72" height="72">
      <span><strong>Shalvi Technologies</strong><small>Expertise · Experience · Excellence</small></span>
    </a>
    <nav class="links" id="nav">
      <a href="#home" data-go="home" class="on">Home</a>
      <a href="#about" data-go="about">Company</a>
      <a href="#products" data-go="products">Portfolio</a>
      <a href="#solutions" data-go="solutions">Solutions</a>
      <a href="#web" data-go="web">Web</a>
      <a href="#alliances" data-go="alliances">Alliances</a>
      <a class="go" href="#contact" data-go="contact">Enquire</a>
    </nav>
    <button class="burger" type="button" id="burger">Menu</button>
  </div>
</header>

<main id="main">

<section class="view is-on" id="home">
  <section class="hero">
    <div class="wrap hero-in">
      <div>
      <p class="kicker">Expertise · Experience · Excellence</p>
      <h1>True north for the <span class="em">tender</span> and the site.</h1>
      <p class="lede">Shalvi Technologies specifies, supplies and supports information technology, surveillance, audio-visual systems, websites, civic programmes, cyber security software, forensic systems and drones. Government, PSU, campus and corporate — from Aranya Estate, Lucknow.</p>
      <div class="row">
        <a class="btn btn-gold" href="#products" data-go="products">Open the portfolio</a>
        <a class="btn btn-line" href="tel:+916307057085">Call 63070 57085</a>
      </div>
      <div class="hero-foot">
        <span>GeM listed</span>
        <span>HP · HPE · Dell · Cisco · Hikvision · Microsoft</span>
        <span>Plot 67–68, Ahmamau, Lucknow 226002</span>
      </div>
      </div>
      <div class="hero-mark"><img src="LOGO_URI" alt="Shalvi Technologies emblem — compass rose with ST orb"></div>
    </div>
  </section>
  <section class="sec">
    <div class="wrap">
      <div class="sec-head"><span class="eye">How we work</span><h2>Three moves. No theatre.</h2></div>
      <div class="tri">
        <article><em>Specify</em><p>Read the building, the sanction and the user. Compare what the market actually offers. Write the bill of quantity that will survive a technical committee.</p></article>
        <article><em>Supply</em><p>Desktops to video walls, cameras to fire panels — from alliances on the official line card. GeM where the indent demands it.</p></article>
        <article><em>Support</em><p>Handover that the clerk can run the next morning. Service after the invoice, because the installed base is how this company is paid the second time.</p></article>
      </div>
    </div>
  </section>
  <section class="sec" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head"><span class="eye">Capabilities</span><h2>The practices of the house.</h2></div>
      <div class="caps">
        <a class="cap" href="#solutions" data-go="solutions">{{CAP:products}}<b>01</b><h3>Products</h3><p>Compute, print, power, boards, licensed software.</p></a>
        <a class="cap" href="#solutions" data-go="solutions">{{CAP:solutions}}<b>02</b><h3>Solutions</h3><p>Requirement first. Then the stack that fits the site.</p></a>
        <a class="cap" href="#solutions" data-go="solutions">{{CAP:networking}}<b>03</b><h3>Networking</h3><p>Cisco, D-Link, Digisol, TP-Link — campus and office.</p></a>
        <a class="cap" href="#solutions" data-go="solutions">{{CAP:integration}}<b>04</b><h3>System integration</h3><p>Compute, AV, access and cameras as one handover.</p></a>
        <a class="cap" href="#solutions" data-go="solutions">{{CAP:specialized}}<b>05</b><h3>Specialized service</h3><p>Queue, waste, medical, anti-smog — Swachh and Ayushman lines.</p></a>
        <a class="cap" href="#products" data-go="products">{{CAP:security}}<b>06</b><h3>Security</h3><p>CCTV, biometrics, barriers, fire, baggage screening.</p></a>
        <a class="cap" href="#web" data-go="web">{{CAP:web}}<b>07</b><h3>Web</h3><p>Website development, hosting and management.</p></a>
        <a class="cap" href="#solutions" data-go="solutions">{{CAP:cyber}}<b>08</b><h3>Software and Cyber security</h3><p>Cyber security software — specify the requirement, then the stack.</p></a>
        <a class="cap" href="#solutions" data-go="solutions">{{CAP:forensic-lab}}<b>09</b><h3>Forensic lab set-up Software</h3><p>Forensic software for laboratory set-up, specified against the lab.</p></a>
        <a class="cap" href="#solutions" data-go="solutions">{{CAP:forensic-ws}}<b>10</b><h3>Forensic Work station Desktop</h3><p>Desktop workstations specified for forensic work.</p></a>
        <a class="cap" href="#solutions" data-go="solutions">{{CAP:drones}}<b>11</b><h3>Drones</h3><p>Unmanned aerial systems specified for the site and the task.</p></a>
      </div>
    </div>
  </section>
  <section class="sec dark">
    <div class="wrap">
      <span class="eye">Who commissions the work</span>
      <h2>The rooms this company already knows.</h2>
      <p>Long relations. An installed base. Complex government and corporate projects executed from Lucknow.</p>
      <div class="grid6" style="margin-top:36px">
        <span>Central Government</span><span>State Government</span><span>Public Sector</span>
        <span>Research Labs</span><span>Campuses</span><span>Corporate</span>
      </div>
    </div>
  </section>
</section>

<section class="view" id="about">
  <section class="page wrap">
    <nav class="crumbs"><a href="#home" data-go="home">Home</a> / Company</nav>
    <div class="seal"><img src="LOGO_URI" alt="Shalvi Technologies emblem"></div>
    <span class="eye">The company</span>
    <h1>Professionally managed. Technically grounded. Oriented to the solution, not the carton.</h1>
  </section>
  <section class="sec" style="padding-top:8px">
    <div class="wrap split start">
      <div>
        <p class="quote">We analyse the requirement, evaluate the products available, and provide the fit that the site can run.</p>
        <p class="lede">Work began with information technology, audio-visual systems and office automation. It includes website development, hosting and management — and Swachh Bharat waste programmes, Ayushman Bharat medical equipment, queue management and anti-smog systems. The house also takes work in software and cyber security (centred on cyber security software), forensic laboratory set-up software, forensic workstation desktops, and drones.</p>
      </div>
      <div>
        <p>Clients stay because the installed base is mixed and the relationship is long. Government and corporate projects of real complexity have been executed from Lucknow.</p>
        <div class="vals"><span>Customer satisfaction</span><span>Reliability</span><span>Innovation</span><span>Scalability</span></div>
      </div>
    </div>
  </section>
  <section class="sec" style="padding-top:0">
    <div class="wrap split start">
      <div>
        <span class="eye">Leadership</span>
        <h2>Gyanesh Shukla</h2>
        <p class="lede">Proprietor. Graduate of Punjab Technical University, Jalandhar. Plot No. 67–68, Aranya Estate, C.G. City, Ahmamau, Sultanpur Road, Near Law College, Lucknow 226002.</p>
      </div>
      <figure><img class="flyer" src="FLYER_URI" alt="Official Shalvi Technologies flyer"></figure>
    </div>
  </section>
</section>

<section class="view" id="products">
  <section class="page wrap">
    <nav class="crumbs"><a href="#home" data-go="home">Home</a> / Portfolio</nav>
    <span class="eye">Line card</span>
    <h1>The official portfolio.</h1>
    <p class="lede">Sixteen categories from the company flyer, plus cyber security software, forensic software, forensic workstations and drones. Filter, then ask for current models and GeM listings.</p>
    <div class="filter" data-filter>
      <button class="on" data-key="all" type="button">All</button>
      <button data-key="it" type="button">IT</button>
      <button data-key="sec" type="button">Security</button>
      <button data-key="av" type="button">AV</button>
      <button data-key="power" type="button">Power</button>
      <button data-key="net" type="button">Network</button>
      <button data-key="work" type="button">Cyber · forensic · drones</button>
    </div>
    <table class="catalog">
      <tr data-row="it"><td>01</td><td>{{MARK:products}}Desktop, AIO &amp; laptop</td><td>HP, Acer, Dell, Lenovo</td></tr>
      <tr data-row="sec"><td>02</td><td>{{MARK:security}}CCTV &amp; recorders</td><td>CP Plus, Hikvision, Sparsh, Tentronix, Dahua, Samsung, Honeywell, Panasonic, Pelco, Axis, ACTi, Matrix, Secure Eye</td></tr>
      <tr data-row="it"><td>03</td><td>MFM &amp; printers</td><td>HP, Epson, Canon, TVS-E, Ricoh, Kyocera, Konica Minolta, Brother</td></tr>
      <tr data-row="av"><td>04</td><td>{{MARK:av}}LED video wall</td><td>VDT</td></tr>
      <tr data-row="av"><td>05</td><td>Interactive boards &amp; panels</td><td>CP Plus, Vamaa, Brio Touch, Promark</td></tr>
      <tr data-row="av"><td>06</td><td>Projectors</td><td>Epson, ViewSonic, BenQ</td></tr>
      <tr data-row="power"><td>07</td><td>UPS &amp; inverters</td><td>Microtek, Elnova, Luminous, APC, Emerson</td></tr>
      <tr data-row="power"><td>08</td><td>Batteries</td><td>Exide, Luminous, Quanta</td></tr>
      <tr data-row="it"><td>09</td><td>Servers &amp; workstations</td><td>HPE, HP, Acer</td></tr>
      <tr data-row="sec"><td>10</td><td>Biometrics &amp; access</td><td>Timewatch, Realtime, eSSL, CP Plus, Matrix, Secure Eye</td></tr>
      <tr data-row="it"><td>11</td><td>Telephone exchanges</td><td>Matrix, Panasonic, CCL, Crystal</td></tr>
      <tr data-row="it"><td>12</td><td>Telephones</td><td>Beetel, Panasonic</td></tr>
      <tr data-row="sec"><td>13</td><td>Barriers, DFMD, X-ray, HHMD</td><td>Tentronix, Timewatch, Hikvision, Realtime</td></tr>
      <tr data-row="sec"><td>14</td><td>Fire alarm</td><td>Agni, Cooper, FAAST, GST, Morley, IAS, Ravel</td></tr>
      <tr data-row="it"><td>15</td><td>Software</td><td>Windows, Office, Busy, Tally, Quick Heal</td></tr>
      <tr data-row="net"><td>16</td><td>{{MARK:networking}}Networking</td><td>Digisol, D-Link, Cisco, TP-Link, Marx</td></tr>
      <tr data-row="work"><td>17</td><td>{{MARK:cyber}}Software and Cyber security</td><td>Cyber security software</td></tr>
      <tr data-row="work"><td>18</td><td>{{MARK:forensic-lab}}Forensic lab set-up Software</td><td>Forensic software</td></tr>
      <tr data-row="work"><td>19</td><td>{{MARK:forensic-ws}}Forensic Work station Desktop</td><td>Desktop workstations for forensic work</td></tr>
      <tr data-row="work"><td>20</td><td>{{MARK:drones}}Drones</td><td>Unmanned aerial systems</td></tr>
    </table>
    <p class="lede" style="margin-top:28px"><a href="#web" data-go="web">Website development, hosting and management →</a></p>
  </section>
</section>

<section class="view" id="solutions">
  <section class="page wrap">
    <nav class="crumbs"><a href="#home" data-go="home">Home</a> / Solutions</nav>
    <span class="eye">Practices</span>
    <h1>A printer is a product. A campus is a project.</h1>
    <p class="lede">We say which one you have asked for — then specify, supply and support it.</p>
  </section>
  <section class="sec" style="padding-top:0">
    <div class="wrap caps">
      <article class="cap">{{CAP:products}}<b>IT</b><h3>Compute, print, power</h3><p>Desktops, servers, printers, UPS, batteries, Windows, Office, Tally, Busy, Quick Heal.</p></article>
      <article class="cap">{{CAP:av}}<b>AV</b><h3>Rooms that present</h3><p>Interactive boards, flat panels, projectors, LED video walls.</p></article>
      <article class="cap">{{CAP:security}}<b>SEC</b><h3>Surveillance and access</h3><p>CCTV, biometrics, barriers, detectors, X-ray baggage, fire alarm.</p></article>
      <article class="cap">{{CAP:networking}}<b>NET</b><h3>Campus networks</h3><p>Cisco, D-Link, Digisol, TP-Link — switching, wireless, structured work.</p></article>
      <article class="cap">{{CAP:integration}}<b>SI</b><h3>One handover</h3><p>Compute, AV, access and cameras specified together.</p></article>
      <article class="cap">{{CAP:specialized}}<b>CIV</b><h3>Swachh &amp; Ayushman</h3><p>Queue, MSW, medical waste, cleaning, anti-smog, medical equipment.</p></article>
      <a class="cap" href="#web" data-go="web">{{CAP:web}}<b>WEB</b><h3>Development, hosting, management</h3><p>New sites, domain and hosting, SSL, mail, updates and a retainer.</p></a>
      <article class="cap">{{CAP:cyber}}<b>CYB</b><h3>Software and Cyber security</h3><p>The work is centred on cyber security software. Specify the requirement; then the stack the site can run.</p></article>
      <article class="cap">{{CAP:forensic-lab}}<b>FOR</b><h3>Forensic lab set-up Software</h3><p>The work is centred on forensic software for laboratory set-up — specified against the lab, not a catalogue page.</p></article>
      <article class="cap">{{CAP:forensic-ws}}<b>FWS</b><h3>Forensic Work station Desktop</h3><p>Desktop workstations specified for forensic work. Current models confirmed before a bid.</p></article>
      <article class="cap">{{CAP:drones}}<b>UAV</b><h3>Drones</h3><p>Unmanned aerial systems. Specify the site and the task; then the airframe and payload that fit.</p></article>
    </div>
  </section>
</section>

<section class="view" id="web">
  <section class="page wrap">
    <nav class="crumbs"><a href="#home" data-go="home">Home</a> / Web</nav>
    <span class="eye">Digital presence</span>
    {{CAP:web}}
    <h1>Website development, hosting and management.</h1>
    <p class="lede">A public site that matches the office: specified, put on a server, and kept running.</p>
    <div class="row">
      <a class="btn btn-red" href="#contact" data-go="contact">Enquire for a site</a>
      <a class="btn btn-ink" href="tel:+916307057085">Call 63070 57085</a>
    </div>
  </section>
  <section class="sec" style="padding-top:8px">
    <div class="wrap tri">
      <article><em>Develop</em><p>Institution and company sites — structure, pages, forms and a look that can be defended in a committee.</p></article>
      <article><em>Host</em><p>Domain, DNS, SSL and a stable host. Mailboxes that match the organisation. Backups before something fails.</p></article>
      <article><em>Manage</em><p>Updates, content changes, uptime watch and a named person to call.</p></article>
    </div>
  </section>
  <section class="sec" style="padding-top:0">
    <div class="wrap split start">
      <div>
        <span class="eye">What we take on</span>
        <h2>From a first site to a property that already exists.</h2>
        <p class="lede">New brochure sites, campus pages, catalogues, enquiry forms, and the rescue of a domain that is live but dead.</p>
      </div>
      <div class="vals">
        <span>New website build</span><span>Domain &amp; hosting</span>
        <span>SSL &amp; email</span><span>Content updates</span>
        <span>Security patches</span><span>Annual retainers</span>
      </div>
    </div>
  </section>
</section>

<section class="view" id="alliances">
  <section class="page wrap">
    <nav class="crumbs"><a href="#home" data-go="home">Home</a> / Alliances</nav>
    <span class="eye">Associates</span>
    <h1>The names on the profile and the flyer.</h1>
    <p class="lede">Channel status is confirmed before a bid.</p>
    <div class="names">
      <span>HP</span><span>HPE</span><span>Acer</span><span>Dell</span><span>Apple</span><span>Lenovo</span>
      <span>Cisco</span><span>Microsoft</span><span>D-Link</span><span>Digisol</span><span>Avanti</span>
      <span>BenQ</span><span>Fusion Craft</span><span>Hikvision</span><span>CP Plus</span><span>Sparsh</span>
      <span>Epson</span><span>ViewSonic</span><span>Quick Heal</span><span>Databyte</span><span>Mediline</span>
      <span>Vortron</span><span>Matrix</span><span>Luminous</span><span>Microtek</span>
    </div>
  </section>
</section>

<section class="view" id="contact">
  <section class="page wrap">
    <nav class="crumbs"><a href="#home" data-go="home">Home</a> / Enquire</nav>
    <span class="eye">Reach</span>
    <h1>Send the indent. We will say what fits.</h1>
  </section>
  <section class="sec" style="padding-top:0">
    <div class="wrap split start">
      <form class="form" id="enquiry" novalidate>
        <div class="ok">Your mail app should open. If not: <a href="mailto:info@shalvitechnologies.com">info@shalvitechnologies.com</a></div>
        <div class="fields">
          <label>Name<input name="name" required><span class="err"></span></label>
          <label>Email<input name="email" type="email" required><span class="err"></span></label>
          <label>Organisation<input name="org"></label>
          <label>Interest
            <select name="interest" required>
              <option value="">Select</option>
              <option>IT / computers / servers</option>
              <option>CCTV &amp; security</option>
              <option>Software and Cyber security</option>
              <option>Forensic lab set-up Software</option>
              <option>Forensic Work station Desktop</option>
              <option>Drones</option>
              <option>Audio-visual</option>
              <option>Networking</option>
              <option>Website development</option>
              <option>Hosting &amp; management</option>
              <option>GeM / tender</option>
              <option>Other</option>
            </select>
            <span class="err"></span>
          </label>
          <label>Message<textarea name="message" required></textarea><span class="err"></span></label>
          <button class="btn btn-red" type="submit">Open enquiry email</button>
          <p class="note">Opens your email client.</p>
        </div>
      </form>
      <aside class="office">
        <span class="eye">Office</span>
        <h2>Shalvi Technologies</h2>
        <p>Plot No. 67–68, Aranya Estate, C.G. City<br>Ahmamau, Sultanpur Road, Near Law College<br>Lucknow 226002</p>
        <p>
          <a href="tel:+916307057085">+91 63070 57085</a><br>
          <a href="tel:+919794980001">+91 97949 80001</a><br>
          <a href="mailto:info@shalvitechnologies.com">info@shalvitechnologies.com</a>
        </p>
        <div class="row">
          <a class="btn btn-gold" href="https://wa.me/916307057085">WhatsApp</a>
          <a class="btn btn-line" href="https://maps.google.com/?q=Aranya+Estate+Ahmamau+Lucknow">Map</a>
        </div>
      </aside>
    </div>
  </section>
</section>

</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="foot">
      <div>
        <div class="foot-brand">
          <img src="LOGO_URI" alt="Shalvi Technologies emblem" width="320" height="320">
          <div>
        <h2>Shalvi Technologies</h2>
        <p>Specify. Supply. Support. IT, security, audio-visual, websites, civic programmes, cyber security software, forensic systems and drones from Lucknow.</p>
        <p>Plot No. 67–68, Aranya Estate, C.G. City, Ahmamau, Sultanpur Road, Near Law College, Lucknow 226002</p>
          </div>
        </div>
      </div>
      <div>
        <h2>Site</h2>
        <ul>
          <li><a href="#about" data-go="about">Company</a></li>
          <li><a href="#products" data-go="products">Portfolio</a></li>
          <li><a href="#solutions" data-go="solutions">Solutions</a></li>
          <li><a href="#web" data-go="web">Web</a></li>
          <li><a href="#alliances" data-go="alliances">Alliances</a></li>
        </ul>
      </div>
      <div>
        <h2>Reach</h2>
        <ul>
          <li><a href="tel:+916307057085">+91 63070 57085</a></li>
          <li><a href="tel:+919794980001">+91 97949 80001</a></li>
          <li><a href="https://wa.me/916307057085">WhatsApp</a></li>
          <li><a href="mailto:info@shalvitechnologies.com">info@shalvitechnologies.com</a></li>
          <li><a href="https://www.facebook.com/shalvitechnologies.in" rel="noopener noreferrer">Facebook</a></li>
        </ul>
      </div>
    </div>
    <div class="social-dock" data-social-dock></div>
    <div class="legal">
      <span>© <span id="year"></span> Shalvi Technologies</span>
      <span>www.shalvitechnologies.in</span>
    </div>
  </div>
</footer>

<script>
(function(){
  var header=document.getElementById("header");
  var nav=document.getElementById("nav");
  var burger=document.getElementById("burger");
  document.getElementById("year").textContent=String(new Date().getFullYear());
  function show(id){
    document.querySelectorAll(".view").forEach(function(v){v.classList.toggle("is-on", v.id===id);});
    document.querySelectorAll("[data-go]").forEach(function(a){a.classList.toggle("on", a.getAttribute("data-go")===id);});
    document.body.classList.toggle("is-home", id==="home");
    header.classList.remove("solid");
    nav.classList.remove("open");
    burger.textContent="Menu";
    window.scrollTo(0,0);
    if(history.replaceState) history.replaceState(null,"","#"+id);
  }
  document.addEventListener("click", function(e){
    var a=e.target.closest("[data-go]");
    if(!a) return;
    e.preventDefault();
    show(a.getAttribute("data-go"));
  });
  burger.addEventListener("click", function(){
    var open=nav.classList.toggle("open");
    burger.textContent=open?"Close":"Menu";
  });
  window.addEventListener("scroll", function(){
    if(document.body.classList.contains("is-home")) header.classList.toggle("solid", window.scrollY>36);
  }, {passive:true});
  var start=(location.hash||"#home").replace("#","");
  if(!document.getElementById(start)) start="home";
  show(start);
  document.querySelectorAll("[data-filter]").forEach(function(box){
    box.addEventListener("click", function(e){
      var btn=e.target.closest("button");
      if(!btn) return;
      box.querySelectorAll("button").forEach(function(b){b.classList.remove("on");});
      btn.classList.add("on");
      var key=btn.getAttribute("data-key");
      document.querySelectorAll("[data-row]").forEach(function(row){
        row.hidden=key!=="all" && row.getAttribute("data-row")!==key;
      });
    });
  });
  var form=document.getElementById("enquiry");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var ok=true;
    form.querySelectorAll("[required]").forEach(function(field){
      var err=field.parentElement.querySelector(".err");
      var empty=!field.value.trim();
      if(err) err.textContent=empty?"Required":"";
      if(empty) ok=false;
    });
    if(!ok) return;
    var d=new FormData(form);
    var body="Name: "+d.get("name")+"\nEmail: "+d.get("email")+"\nOrganisation: "+(d.get("org")||"-")+"\nInterest: "+d.get("interest")+"\n\n"+d.get("message");
    location.href="mailto:info@shalvitechnologies.com?subject="+encodeURIComponent("Enquiry — Shalvi Technologies")+"&body="+encodeURIComponent(body);
    form.classList.add("sent");
  });
})();
DESK_JS
SOCIAL_JS
</script>
</body>
</html>
'''

html = html.replace("CSS_HERE", css)
html = html.replace("LOGO_URI", logo)
html = html.replace("FLYER_URI", flyer)
html = html.replace("DESK_JS", desk_js)
html = html.replace("SOCIAL_JS", social_js)
for _name in (
    "products", "solutions", "networking", "integration", "specialized",
    "security", "web", "cyber", "forensic-lab", "forensic-ws", "drones", "av",
):
    html = html.replace("{{CAP:%s}}" % _name, cap_img(_name))
    html = html.replace("{{MARK:%s}}" % _name, cat_mark(_name))

out1 = root / "shalvitechnologies.html"
out2 = root / "SHARE" / "shalvitechnologies.html"
out1.write_text(html, encoding="utf-8")
out2.parent.mkdir(parents=True, exist_ok=True)
out2.write_text(html, encoding="utf-8")
print("wrote", out1, "bytes", out1.stat().st_size)
print("wrote", out2)
