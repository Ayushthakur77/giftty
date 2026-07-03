const fs = require('fs');

let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const importsToAdd = `
import { motion } from "framer-motion";
`;

code = importsToAdd + code;

const effectUpdate = `
  const [banners, setBanners] = useState<any[]>([]);
  const [sectionsOrder, setSectionsOrder] = useState<string[]>(['Hero', 'Trending', 'Categories', 'Festival Highlights', 'Testimonials']);

  useEffect(() => {
    fetch("/api/products/trending")
      .then(res => res.json())
      .then(data => {
        setTrendingProducts(data.products || []);
        setOccasion(data.occasion || "Gifts");
      })
      .catch(console.error);

    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        const catArray = Array.isArray(data) ? data : [];
        setCategories(catArray.filter((c: any) => c.isEnabled).sort((a: any, b: any) => a.sortOrder - b.sortOrder));
      })
      .catch(console.error);
      
    fetch("/api/banners")
      .then(res => res.json())
      .then(data => {
        setBanners(data || []);
      })
      .catch(console.error);
      
    fetch("/api/settings/homepage-sections")
      .then(res => res.json())
      .then(data => {
        if(data && Array.isArray(data)) setSectionsOrder(data);
      })
      .catch(console.error);
  }, []);
`;

code = code.replace(/useEffect\(\(\) => {[\s\S]*?}, \[\]\);/, effectUpdate);

fs.writeFileSync('src/pages/Home.tsx', code);
