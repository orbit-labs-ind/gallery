import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Title,
  Text,
  Card,
  Image,
  Group,
  SimpleGrid,
  Button,
  Modal,
  TextInput,
  Select,
  Stack,
} from "@mantine/core";

const API = "http://localhost:3001/api/albums";

export default function DashboardPage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [albums, setAlbums] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newAlbum, setNewAlbum] = useState({
    title: "",
    description: "",
    albumType: "static",
    createdBy: "admin1",
    organization: "MyCompany",
    privacy: "public",
    users: [],
    media: [],
    permissions: [],
  });

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const res = await axios.get(API);
      setAlbums(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // CREATE OR UPDATE
  const handleSaveAlbum = async () => {
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, newAlbum);
      } else {
        await axios.post(API, newAlbum);
      }

      resetForm();
      fetchAlbums();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/${id}`);
      fetchAlbums();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (album, e) => {
    e.stopPropagation();
    setEditingId(album._id);
    setNewAlbum(album);
    setOpened(true);
  };

  const handleClick = (album) => {
    navigate(`/images/${album._id}`);
  };

  const resetForm = () => {
    setOpened(false);
    setEditingId(null);
    setNewAlbum({
      title: "",
      description: "",
      albumType: "static",
      createdBy: "admin1",
      organization: "MyCompany",
      privacy: "public",
      users: [],
      media: [],
      permissions: [],
    });
  };

  const AlbumCard = ({ album }) => (
    <Card
      shadow="md"
      radius="lg"
      padding={0}
      style={{ cursor: "pointer", overflow: "hidden", position: "relative" }}
      onClick={() => handleClick(album)}
    >
      <Image
        src={
          album.thumbnail ||
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
        }
        height={250}
        fit="cover"
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1))",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 15,
          left: 15,
          right: 15,
          color: "white",
        }}
      >
        <Text fw={700} size="lg">
          {album.title}
        </Text>
        <Text size="sm">
          {new Date(album.createdAt).toLocaleDateString()}
        </Text>

        <Group mt="sm">
          <Button
            size="xs"
            color="blue"
            onClick={(e) => handleEdit(album, e)}
          >
            Edit
          </Button>

          <Button
            size="xs"
            color="red"
            onClick={(e) => handleDelete(album._id, e)}
          >
            Delete
          </Button>
        </Group>
      </div>
    </Card>
  );

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb={30}>
        <Title order={2}>My Albums</Title>
        <Button onClick={() => setOpened(true)}>+ Create Album</Button>
      </Group>

      {/* MODAL */}
      <Modal
        opened={opened}
        onClose={resetForm}
        title={editingId ? "Update Album" : "Create Album"}
      >
        <Stack>
          <TextInput
            label="Title"
            value={newAlbum.title}
            onChange={(e) =>
              setNewAlbum({ ...newAlbum, title: e.target.value })
            }
          />

          <TextInput
            label="Description"
            value={newAlbum.description}
            onChange={(e) =>
              setNewAlbum({ ...newAlbum, description: e.target.value })
            }
          />

          <Select
            label="Privacy"
            data={["public", "private", "restricted"]}
            value={newAlbum.privacy}
            onChange={(value) =>
              setNewAlbum({ ...newAlbum, privacy: value })
            }
          />

          <Button fullWidth onClick={handleSaveAlbum}>
            {editingId ? "Update" : "Create"}
          </Button>
        </Stack>
      </Modal>

      {!isMobile ? (
        <Carousel
          slideSize="33.333%"
          slideGap="lg"
          align="start"
          previousControlIcon={<IconArrowLeft size={16} />}
          nextControlIcon={<IconArrowRight size={16} />}
        >
          {albums.map((album) => (
            <Carousel.Slide key={album._id}>
              <AlbumCard album={album} />
            </Carousel.Slide>
          ))}
        </Carousel>
      ) : (
        <SimpleGrid cols={1}>
          {albums.map((album) => (
            <AlbumCard key={album._id} album={album} />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}