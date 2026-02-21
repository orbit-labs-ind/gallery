import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Image,
  Badge,
  Group,
  SimpleGrid,
  Button,
} from "@mantine/core";

const albums = [
  {
    id: "random_id_1",
    title: "Family Tour",
    created_at: "01-01-2026",
    updated_at: "01-01-2026",
    tags: ["family", "tour", "travel"],
    cover_image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    is_accessible: true,
  },
  {
    id: "random_id_2",
    title: "Wedding",
    created_at: "01-01-2026",
    updated_at: "01-01-2026",
    tags: ["wedding", "marriage", "ceremony"],
    cover_image:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf",
    is_accessible: false,
  },
  {
    id: "random_id_3",
    title: "Birthday Party",
    created_at: "01-01-2026",
    updated_at: "01-01-2026",
    tags: ["birthday", "celebration"],
    cover_image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3",
    is_accessible: true,
  },
  {
    id: "random_id_4",
    title: "College Trip",
    created_at: "01-01-2026",
    updated_at: "01-01-2026",
    tags: ["college", "friends", "trip"],
    cover_image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    is_accessible: true,
  },
  {
    id: "random_id_5",
    title: "Nature Camp",
    created_at: "01-01-2026",
    updated_at: "01-01-2026",
    tags: ["nature", "camp", "adventure"],
    cover_image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    is_accessible: false,
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [selectedTag, setSelectedTag] = useState(null);
  const [showMore, setShowMore] = useState(false); // ✅ NEW

  const handleClick = (album) => {
    navigate("/images", { state: { album } });
  };

 
  //  Get All Unique Tags
  const allTags = [...new Set(albums.flatMap((album) => album.tags))];

  //  Show First 6 Tags Initially
  const visibleTags = showMore ? allTags : allTags.slice(0, 6);

  //  Filter Albums Based On Tag
  const filteredAlbums = selectedTag
    ? albums.filter((album) => album.tags.includes(selectedTag))
    : albums;

  const AlbumCard = ({ album }) => {
    // Format date (optional but recommended)
    const formatDate = (dateStr) => {
      const date = new Date(dateStr.split("-").reverse().join("-"));
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const getTimeAgo = (dateStr) => {
      const date = new Date(dateStr.split("-").reverse().join("-"));
      const now = new Date();
      const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diff < 1) return "Today";
      if (diff < 30) return `${diff} Days ago`;
      if (diff < 365) return `${Math.floor(diff / 30)} Months ago`;
      return `${Math.floor(diff / 365)} Years ago`;
    };

    return (
      <Card
        shadow="md"
        radius="lg"
        padding={0}
        withBorder={false}
        style={{
          cursor: "pointer",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={() => handleClick(album)}
      >
        {/* Bg Image */}
        <Image
          src={album.cover_image}
          height={300}
          alt={album.title}
          fit="cover"
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1))",
          }}
        />

        {/* Text Content */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <Text fw={700} size="xl">
              {album.title}
            </Text>
            <Text size="sm">
              {formatDate(album.created_at)}
            </Text>
          </div>

          <Text size="xs">
            {getTimeAgo(album.created_at)}
          </Text>
        </div>
      </Card>
    );
  };


  return (
    <Container size="lg" py="xl">

      {/*  Header Section  */}

      <Text ta="center" c="dimmed" fw={600} size="sm" tt="uppercase" mb={5}>
        Gallery
      </Text>

      <Title ta="center" order={1} fw={700} mb={10}>
        My Visual Diary
      </Title>

      <Text ta="center" c="dimmed" size="md" mb={40}>
        See the world through my lens: adventures in photos and videos
      </Text>

      {/*  Tag Filter Section  */}

      <Group justify="center" mb={20} gap="sm" wrap="wrap">
        <Button
          radius="xl"
          variant={selectedTag === null ? "filled" : "default"}
          onClick={() => setSelectedTag(null)}
        >
          All
        </Button>

        {visibleTags.map((tag) => (
          <Button
            key={tag}
            radius="xl"
            variant={selectedTag === tag ? "filled" : "default"}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </Button>
        ))}
      </Group>

      {/* View More Button */}

      {allTags.length > 6 && (
        <Group justify="center" mb={40}>
          <Button
            variant="subtle"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "View Less ←" : "View More →"}
          </Button>
        </Group>
      )}

      {/* Desktop  Carousel */}

      {!isMobile && (
        <Carousel
          slideSize="33.333%"
          slideGap="lg"
          align="start"
          height={320}
          previousControlIcon={<IconArrowLeft size={16} />}
          nextControlIcon={<IconArrowRight size={16} />}
          styles={{
            controls: {
              bottom: -40,
              top: "auto",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 12,
            },
            control: {
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          {filteredAlbums.map((album) => (
            <Carousel.Slide key={album.id}>
              <AlbumCard album={album} />
            </Carousel.Slide>
          ))}
        </Carousel>
      )}

      {/* Mobile Grid */}

      {isMobile && (
        <SimpleGrid cols={1} spacing="lg">
          {filteredAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

