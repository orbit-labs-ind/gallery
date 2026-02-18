import { Dropzone } from "@mantine/dropzone";
import {
  IconUpload,
  IconPhoto,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Container,
  Title,
  Text,
  Box,
  Image,
  Card,
  Group,
  Progress,
  rem,
} from "@mantine/core";

function ImgPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const album = location.state?.album;

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  //  Bento Grid Image Data
  const images = [
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
      size: "wide",
    },
    {
      src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
      size: "big",
    },
    {
      src: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800",
      size: "small",
    },
    {
      src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
      size: "tall",
    },
    {
      src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800",
      size: "small",
    },
    {
      src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      size: "wide",
    },
  ];

  if (!album) {
    return (
      <Container py={40}>
        <Title order={3}>No Album Selected</Title>
        <Text mt="md" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          Go back
        </Text>
      </Container>
    );
  }

  const handleUpload = (acceptedFiles) => {
    setFiles(acceptedFiles);
    setUploading(true);
    setUploadComplete(false);

    setTimeout(() => {
      setUploading(false);
      setUploadComplete(true);
    }, 2000);
  };

  return (
    <Container size="lg" py={40}>
      
      {/* Album Header */}
      <Title order={2}>{album.title}</Title>

      <Text c="dimmed" mt={5}>
        {album.is_accessible ? "Public Album" : "Private Album"}
      </Text>

      <Text c="dimmed" mb={30}>
        Tags: {album.tags.join(", ")}
      </Text>

      {/* Bento Grid */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gridAutoRows: "200px",
          gap: "16px",
        }}
      >
        {/* Upload Card */}
        <Card
          shadow="sm"
          padding="md"
          radius="md"
          withBorder
          style={{
            minHeight: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Dropzone
            onDrop={handleUpload}
            maxSize={5 * 1024 ** 2}
            accept={["image/png", "image/jpeg", "image/webp"]}
            style={{
              width: "100%",
              height: "100%",
              border: "2px dashed #d1d5db",
              borderRadius: rem(8),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Group justify="center" style={{ pointerEvents: "none" }}>
              <Dropzone.Accept>
                <IconUpload size={40} color="green" />
              </Dropzone.Accept>

              <Dropzone.Reject>
                <IconX size={40} color="red" />
              </Dropzone.Reject>

              <Dropzone.Idle>
                {uploadComplete ? (
                  <IconCheck size={40} color="green" />
                ) : (
                  <IconPhoto size={40} />
                )}
              </Dropzone.Idle>

              <div>
                {uploading ? (
                  <>
                    <Text size="sm" ta="center">
                      Uploading...
                    </Text>
                    <Progress mt="sm" value={70} animated />
                  </>
                ) : uploadComplete ? (
                  <Text size="sm" ta="center" c="green">
                    Upload Complete
                  </Text>
                ) : (
                  <>
                    <Text size="sm" ta="center">
                      Drag images here or click to upload
                    </Text>
                    <Text size="xs" c="dimmed" ta="center">
                      PNG, JPG, WEBP (max 5MB)
                    </Text>
                  </>
                )}
              </div>
            </Group>
          </Dropzone>
        </Card>

        {/* Image Cards  */}

        {images.map((item, index) => {
          let gridStyle = {};

          if (item.size === "wide") {
            gridStyle = { gridColumn: "span 2" };
          } else if (item.size === "tall") {
            gridStyle = { gridRow: "span 2" };
          } else if (item.size === "big") {
            gridStyle = { gridColumn: "span 2", gridRow: "span 2" };
          }

          return (
            <Image
              key={index}
              src={item.src}
              radius="md"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                ...gridStyle,
              }}
            />
          );
        })}
      </Box>
    </Container>
  );
}

export default ImgPage;
