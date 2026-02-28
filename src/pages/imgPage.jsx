import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Title, Text, Badge, Stack } from "@mantine/core";

const API = "http://localhost:3001/api/albums";

function ImgPage() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);

  useEffect(() => {
    fetchAlbum();
  }, [id]);

  const fetchAlbum = async () => {
    try {
      const res = await axios.get(`${API}/${id}`);
      setAlbum(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!album) return <Text>Loading...</Text>;

  return (
    <Container py={40}>
      <Stack>
        <Title order={2}>{album.title}</Title>

        <Text>{album.description}</Text>

        <Badge color="blue">{album.privacy}</Badge>
        <Badge color="green">{album.albumType}</Badge>

        <Text size="sm">
          Created: {new Date(album.createdAt).toLocaleDateString()}
        </Text>
      </Stack>
    </Container>
  );
}

export default ImgPage;