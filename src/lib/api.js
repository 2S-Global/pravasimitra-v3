export async function fetchBlogs() {
  console.log("Calling fetchBlogs()");

  const res = await fetch("https://dummyjson.com/posts", {
    cache: "no-store", // Use no-store for server-side fetching
  });

  if (!res.ok) throw new Error("Failed to fetch blogs");

  const data = await res.json();
  console.log("Fetched blogs:", data);

  return data;
}
