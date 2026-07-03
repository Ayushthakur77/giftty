import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function CMSPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/cms/${slug}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        setPage(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPage();
  }, [slug]);

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  }

  if (error || !page) {
    return <Navigate to="/404" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">{page.title}</h1>
      <div className="prose prose-indigo max-w-none" dangerouslySetInnerHTML={{ __html: page.content || "" }} />
    </div>
  );
}
