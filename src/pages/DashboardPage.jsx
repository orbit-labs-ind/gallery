import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Carousel } from '@mantine/carousel';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { IoHome } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Chip,
  Image,
  Stack,
  Center,
  Flex,
} from '@mantine/core';

const images = [
  'https://images.unsplash.com/photo-1768471126957-df36ac318dc1?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1769109004486-b9270b5654c1?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1768813282031-2aec62eee8b7?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1766488679837-b87f8311a82b?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1767627651257-f7ed7a0d8146?w=600&auto=format&fit=crop&q=60',
];

const categories = [
  'Italy',
  'Dubai',
  'London',
  'Berlin',
  'Rome',
  'Lisbon',
  'India',
  'China',
  'Japan',
];

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <Container size="xl" py={40}>
      {/* HEADER */}
      <Stack align="center" spacing={6}>
        <Text size="sm" fw={600} c="dimmed">
          GALLERY
        </Text>

        <Title order={1}>My Visual Diary</Title>

        <Text c="dimmed" ta="center" maw={420}>
          See the world through my lens: adventures in photos and videos
        </Text>
      </Stack>

      {/* CATEGORY FILTER  */}
      <Center mt={30}>
        <Group>
          {categories.map((item, index) => (
            <Chip key={index} radius="xl" variant="outline">
              {item}
            </Chip>
          ))}

          {/* View More Button */}
          <Button
            variant="outline"
            radius="xl"
            color="dark"
            rightSection={<IconArrowRight size={16} />}
            onClick={() => navigate('/images')}
          >
            View More
          </Button>
        </Group>
      </Center>

      {/*  IMAGE SLIDER */}
      <Carousel
        mt={50}
        mb={60}
        height={460}
        slideSize="33.333333%"
        slideGap="lg"
        align="center"
        loop
        previousControlIcon={<IconArrowLeft size={18} />}
        nextControlIcon={<IconArrowRight size={18} />}
        styles={{
          controls: {
            bottom: -45,
            top: 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 16,
          },
          control: {
            borderRadius: '50%',
            width: 42,
            height: 42,
          },
        }}
      >
        {images.map((src, index) => (
          <Carousel.Slide key={index}>
            <Image
              src={src}
              w="100%"
              h={460}
              radius="lg"
              fit="cover"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/images')}
            />
          </Carousel.Slide>
        ))}
      </Carousel>

      {/* DASHBOARD ACTIONS  */}
      <Center mt={50}>
        <Group>
          <Button color="dark" onClick={() => dispatch(logout())}>
            Sign out
          </Button>

          <Link to="/">
            <Flex
              align="center"
              px={12}
              py={8}
              bg="#00000080"
              gap={6}
              style={{ borderRadius: 8 }}
            >
              <IoHome color="white" />
              <Text c="white">Home</Text>
            </Flex>
          </Link>
        </Group>
      </Center>
    </Container>
  );
}

export default DashboardPage;
