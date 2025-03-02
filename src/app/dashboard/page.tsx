"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Home() {
  const searchParams = useSearchParams();
  const username = searchParams?.get("username");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetch(`/api/history?username=${username}`)
        .then((res) => res.json())
        .then((data) => {
          setHistory(data.history);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching history:", err);
          setLoading(false);
        });
    }
  }, [username]);

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard for {username}</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-80 animate-pulse bg-gray-200 rounded-lg h-48"></div>
          ))}
        </div>
      ) : history.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {history.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="w-80 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <h2 className="text-lg font-semibold">{item.result}</h2>
                </CardHeader>
                <CardContent>
                  <motion.img
                    src={`data:image/png;base64,${item.image}`}
                    alt="Uploaded"
                    className="w-full rounded"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-gray-500">No uploads found.</p>
      )}
    </div>
  );
}
