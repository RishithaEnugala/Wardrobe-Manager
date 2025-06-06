export function extractWardrobeInfo(wardrobe) {
  console.log("Extracting wardrobe info...");
  console.log("Original wardrobe data:", wardrobe);

  const extractedData = wardrobe.map(item => {
      console.log("Processing item:", item);

      const extractedItem = Object.entries({
          ID: item.id,
          Category: item.category,
          Gender: item.gender,
          Material: item.material,
          "Color Palette": item.color_palette,
          Season: item.season,
          "Dress Type": item.dress_type,
          Status: item.status,
          "Image URL": item.image_url,
          Brand: item.brand,
          "Care Instructions": item.care_instructions,
          Location: item.location,
          "Last Worn": new Date(item.last_worn).toLocaleDateString(),
          "Date Added": new Date(item.date_added).toLocaleDateString(),
          Name: item.name
      });

      console.log("Extracted item data:", extractedItem);

      return extractedItem;
  });

  console.log("Final extracted wardrobe data:", extractedData);
  return extractedData;
}
