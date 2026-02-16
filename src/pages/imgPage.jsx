import { Container, Image, Box } from "@mantine/core";
import { useEffect, useState } from "react";


function ImgPage() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const sizeTypes = ["small", "wide", "tall", "big"];

    const randomImages = Array.from({ length: 14 }).map(() => {
      const size = sizeTypes[Math.floor(Math.random() * sizeTypes.length)];

      // Adjust image aspect ratio based on type
      
      let width = 600;
      let height = 600;

      if (size === "wide") height = 400;
      if (size === "tall") height = 700;
      if (size === "big") height = 900;

      return {
        src: `https://picsum.photos/${width}/${height}?random=${Math.random()}`,
        size,
      };    
    });

    setImages(randomImages);
  }, []);

  const getSpan = (size) => {
    switch (size) {
      case "wide":
        return { gridColumn: "span 2", gridRow: "span 1" };
      case "tall":
        return { gridColumn: "span 1", gridRow: "span 2" };
      case "big":
        return { gridColumn: "span 2", gridRow: "span 2" };
      default:
        return { gridColumn: "span 1", gridRow: "span 1" };
    }
  };

  return (
    <Container size="xl" py={40}>
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridAutoRows: "200px",
          gap: "16px",
          gridAutoFlow: "dense", // fills empty spaces
        }}
      >
        {images.map((item, index) => (
          <Box
            key={index}
            style={{
              ...getSpan(item.size),
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <Image
              src={item.src}
              fit="cover"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
  
}

export default ImgPage;
