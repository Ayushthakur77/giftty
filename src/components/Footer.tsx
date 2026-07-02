import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react"; // Assuming we want basic icons

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-outline py-16 mt-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-10 max-w-[1280px] mx-auto">
        <div className="space-y-4 col-span-1 md:col-span-1">
          <Link to="/" className="text-2xl font-bold tracking-tight text-primary">
            GiftJoy
          </Link>
          <p className="text-sm text-on-surface-variant">
            We believe that every gift is a bridge between hearts. Our mission is to make those bridges beautiful.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Shopping</h4>
          <ul className="text-sm text-on-surface-variant space-y-3 font-medium">
            <li><Link to="/guides" className="hover:text-primary transition-colors">Gift Guides</Link></li>
            <li><Link to="/personalized" className="hover:text-primary transition-colors">Personalized Gifts</Link></li>
            <li><Link to="/corporate" className="hover:text-primary transition-colors">Corporate Gifting</Link></li>
            <li><Link to="/cards" className="hover:text-primary transition-colors">Gift Cards</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">About GiftJoy</h4>
          <ul className="text-sm text-on-surface-variant space-y-3 font-medium">
            <li><Link to="/story" className="hover:text-primary transition-colors">Our Story</Link></li>
            <li><Link to="/sustainability" className="hover:text-primary transition-colors">Sustainability</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link to="/delivery" className="hover:text-primary transition-colors">Delivery Info</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Stay Inspired</h4>
          <p className="text-sm text-on-surface-variant font-medium">Get the latest gift ideas and 10% off your first order.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2 w-full outline-none focus:ring-1 focus:ring-primary text-sm"
            />
            <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-opacity">
              Join
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1280px] mx-auto px-10 mt-16 pt-8 border-t border-outline-variant text-center">
        <p className="text-xs text-on-surface-variant font-medium">
          © {new Date().getFullYear()} GiftJoy. Handcrafted with love.
        </p>
      </div>
    </footer>
  );
}
