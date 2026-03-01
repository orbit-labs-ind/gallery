//http://localhost:5173/user-details


import React, { useState } from 'react';
import { 
  TextInput, 
  Button, 
  Group, 
  Box, 
  Title, 
  Avatar, 
  FileButton, 
  Text, 
  Tooltip, 
  ActionIcon, 
  Switch, 
  Stack, 
  Container,
  Paper,
  Divider,
  Textarea,
  Flex,
  Select
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { 
  IconCamera, 
  IconInfoCircle, 
  IconPlus, 
  IconCheck,
  IconEye,
  IconEyeOff,
  IconBell,
  IconBellOff,
  IconTrash,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandFacebook
} from '@tabler/icons-react';

const UserDetailsPage = () => {
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [socialMediaLinks, setSocialMediaLinks] = useState(['']);

  const form = useForm({
    initialValues: {
      // Personal Data
      username: '',
      email: '',
      profilePic: null,
      bio: '',
      currentOccupation: '',
      
      // Contact Information
      phone: '',
      countryCode: '+91',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      
      // Settings
      profileVisibility: false,
      notifications: true,
    },
    validate: {
      username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      phone: (value) => value && value.length < 10 ? 'Phone must be at least 10 digits' : null,
      zipCode: (value) => value && !/^\d{5,6}$/.test(value) ? 'Invalid zip code' : null,
    },
  });

  const handleSubmit = (values) => {
    // Combine form data with social media
    const finalData = {
      ...values,
      socialMedia: socialMediaLinks.filter(link => link.trim() !== '')
    };
    
    console.log('Form Values:', finalData);
    
    // Show success notification
    notifications.show({
      title: 'Success!',
      message: 'Your profile has been saved successfully 🎉',
      color: 'teal',
      icon: <IconCheck size={18} />,
    });
  };

  const addSocialMediaField = () => {
    setSocialMediaLinks([...socialMediaLinks, '']);
  };

  const removeSocialMediaField = (index) => {
    const newLinks = socialMediaLinks.filter((_, i) => i !== index);
    setSocialMediaLinks(newLinks);
  };

  const updateSocialMediaLink = (index, value) => {
    const newLinks = [...socialMediaLinks];
    newLinks[index] = value;
    setSocialMediaLinks(newLinks);
  };

  return (
    <Box
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      <Container size="md" py={60}>
        <Paper
          shadow="xl"
          p={50}
          radius="lg"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Paper p={40} radius="md" style={{ background: 'white' }}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack spacing="xl">
                {/* Header */}
                <Box style={{ textAlign: 'center' }}>
                  <Title
                    order={2}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginBottom: 8,
                    }}
                  >
                    Complete Your Profile
                  </Title>
                  <Text size="sm" c="dimmed">
                    Help your team know more about you
                  </Text>
                </Box>

                {/* Profile Picture */}
                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Text fw={500} size="sm" mb="xs">
                    Profile Picture (Optional)
                  </Text>
                  <Box style={{ position: 'relative' }}>
                    <Avatar
                      src={form.values.profilePic ? URL.createObjectURL(form.values.profilePic) : null}
                      size={120}
                      radius="50%"
                      style={{
                        border: '4px solid #667eea',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                      }}
                    >
                      <IconCamera size={40} stroke={1.5} />
                    </Avatar>
                    <FileButton
                      onChange={(file) => form.setFieldValue('profilePic', file)}
                      accept="image/png,image/jpeg,image/jpg"
                    >
                      {(props) => (
                        <ActionIcon
                          {...props}
                          size={36}
                          radius="xl"
                          variant="filled"
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: '3px solid white',
                          }}
                        >
                          <IconCamera size={18} />
                        </ActionIcon>
                      )}
                    </FileButton>
                  </Box>
                </Box>

                <Divider label="Personal Information" labelPosition="center" />

                {/* Username */}
                <TextInput
                  label="Username"
                  placeholder="Enter your username"
                  required
                  size="md"
                  {...form.getInputProps('username')}
                  styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
                />

                {/* Email */}
                <TextInput
                  label="Email"
                  placeholder="your.email@company.com"
                  required
                  type="email"
                  size="md"
                  {...form.getInputProps('email')}
                  styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
                />

                {/* Current Occupation */}
                <Box>
                  <Group spacing={8} mb={8}>
                    <Text fw={600} size="sm">
                      Current Occupation (Optional)
                    </Text>
                    <Tooltip
                      label="It will be helpful for building directories within your organization."
                      multiline
                      width={250}
                      withArrow
                    >
                      <ActionIcon size="xs" variant="subtle" color="gray">
                        <IconInfoCircle size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  <TextInput
                    placeholder="e.g., Software Engineer, Product Manager"
                    size="md"
                    {...form.getInputProps('currentOccupation')}
                  />
                </Box>

                {/* Bio */}
                <Textarea
                  label="Bio (Optional)"
                  placeholder="Tell us about yourself"
                  minRows={3}
                  size="md"
                  {...form.getInputProps('bio')}
                  styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
                />

                {/* Contact Information Toggle */}
                {!showContactInfo && (
                  <Button
                    variant="subtle"
                    onClick={() => setShowContactInfo(true)}
                    style={{ color: '#667eea', width: 'fit-content' }}
                  >
                    <Group spacing={6}>
                      <IconPlus size={18} />
                      <span>Add Contact Information</span>
                    </Group>
                  </Button>
                )}

                {/* Contact Information Section */}
                {showContactInfo && (
                  <>
                    <Divider label="Contact Information" labelPosition="center" />

                    {/* Phone */}
                    <Box>
                      <Text fw={600} size="sm" mb={8}>
                        Phone Number (Optional)
                      </Text>
                      <Group spacing="xs" align="flex-start" style={{ flexWrap: 'nowrap' }}>
                        <Select
                          data={[
                            { value: '+1', label: '+1 (USA)' },
                            { value: '+44', label: '+44 (UK)' },
                            { value: '+91', label: '+91 (India)' },
                            { value: '+86', label: '+86 (China)' },
                            { value: '+81', label: '+81 (Japan)' },
                          ]}
                          value={form.values.countryCode}
                          onChange={(value) => form.setFieldValue('countryCode', value)}
                          size="md"
                          style={{ width: 120, minWidth: 120 }}
                        />
                        <TextInput
                          placeholder="Enter phone number"
                          size="md"
                          style={{ flex: 1 }}
                          {...form.getInputProps('phone')}
                        />
                      </Group>
                    </Box>

                    {/* Address */}
                    <TextInput
                      label="Address (Optional)"
                      placeholder="Street address, apartment, suite, etc."
                      size="md"
                      {...form.getInputProps('address')}
                      styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
                    />

                    {/* City, State, Zip Code */}
                    <Group spacing="md" grow>
                      <TextInput
                        label="City (Optional)"
                        placeholder="Enter city"
                        size="md"
                        {...form.getInputProps('city')}
                        styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
                      />
                      <TextInput
                        label="State (Optional)"
                        placeholder="Enter state"
                        size="md"
                        {...form.getInputProps('state')}
                        styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
                      />
                    </Group>

                    <Group spacing="md" grow>
                      <TextInput
                        label="Zip Code (Optional)"
                        placeholder="Enter zip code"
                        size="md"
                        {...form.getInputProps('zipCode')}
                        styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
                      />
                      <Select
                        label="Country (Optional)"
                        placeholder="Select country"
                        size="md"
                        data={[
                          { value: 'US', label: 'United States' },
                          { value: 'UK', label: 'United Kingdom' },
                          { value: 'IN', label: 'India' },
                          { value: 'CA', label: 'Canada' },
                          { value: 'AU', label: 'Australia' },
                          { value: 'DE', label: 'Germany' },
                          { value: 'FR', label: 'France' },
                          { value: 'JP', label: 'Japan' },
                          { value: 'CN', label: 'China' },
                        ]}
                        searchable
                        {...form.getInputProps('country')}
                        styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
                      />
                    </Group>

                    {/* Social Media Links */}
                    <Box>
                      <Group spacing={8} mb={8}>
                        <Text fw={600} size="sm">
                          Social Media (Optional)
                        </Text>
                        <Group spacing={4}>
                          <IconBrandInstagram size={16} style={{ color: '#E4405F' }} />
                          <IconBrandTwitter size={16} style={{ color: '#1DA1F2' }} />
                          <IconBrandLinkedin size={16} style={{ color: '#0A66C2' }} />
                          <IconBrandFacebook size={16} style={{ color: '#1877F2' }} />
                        </Group>
                      </Group>
                      
                      <Stack spacing="xs">
                        {socialMediaLinks.map((link, index) => (
                          <Group key={index} spacing="xs">
                            <TextInput
                              placeholder="https://twitter.com/yourprofile"
                              size="md"
                              style={{ flex: 1 }}
                              value={link}
                              onChange={(e) => updateSocialMediaLink(index, e.target.value)}
                            />
                            {socialMediaLinks.length > 1 && (
                              <ActionIcon
                                color="red"
                                variant="light"
                                onClick={() => removeSocialMediaField(index)}
                              >
                                <IconTrash size={18} />
                              </ActionIcon>
                            )}
                          </Group>
                        ))}
                      </Stack>
                      
                      <Button
                        variant="light"
                        size="sm"
                        mt="xs"
                        onClick={addSocialMediaField}
                        style={{ color: '#667eea' }}
                      >
                        <Group spacing={6}>
                          <IconPlus size={16} />
                          <span>Add another social media link</span>
                        </Group>
                      </Button>
                    </Box>
                  </>
                )}

                <Divider />

                {/* Settings with Icons */}
                <Stack spacing="md">
                  {/* Profile Visibility */}
                  <Group position="apart" style={{ flexWrap: 'wrap' }}>
                    <Flex align="center" gap={12} style={{ flex: 1, minWidth: 200 }}>
                      {form.values.profileVisibility ? (
                        <IconEye size={24} style={{ color: '#667eea' }} />
                      ) : (
                        <IconEyeOff size={24} style={{ color: '#9ca3af' }} />
                      )}
                      <Box>
                        <Text fw={600} size="sm" mb={2}>
                          Profile Visibility
                        </Text>
                        <Text size="xs" c="dimmed">
                          Control who can see your profile
                        </Text>
                      </Box>
                    </Flex>
                    <Switch
                      size="md"
                      onLabel="Public"
                      offLabel="Private"
                      checked={form.values.profileVisibility}
                      onChange={(event) =>
                        form.setFieldValue('profileVisibility', event.currentTarget.checked)
                      }
                      color="teal"
                    />
                  </Group>

                  {/* Notifications */}
                  <Group position="apart" style={{ flexWrap: 'wrap' }}>
                    <Flex align="center" gap={12} style={{ flex: 1, minWidth: 200 }}>
                      {form.values.notifications ? (
                        <IconBell size={24} style={{ color: '#667eea' }} />
                      ) : (
                        <IconBellOff size={24} style={{ color: '#9ca3af' }} />
                      )}
                      <Box>
                        <Text fw={600} size="sm" mb={2}>
                          Notifications
                        </Text>
                        <Text size="xs" c="dimmed">
                          Receive updates and alerts
                        </Text>
                      </Box>
                    </Flex>
                    <Switch
                      size="md"
                      onLabel="Allow"
                      offLabel="Mute"
                      checked={form.values.notifications}
                      onChange={(event) =>
                        form.setFieldValue('notifications', event.currentTarget.checked)
                      }
                      color="teal"
                    />
                  </Group>
                </Stack>

                <Divider />

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  Save Profile
                </Button>
              </Stack>
            </form>
          </Paper>
        </Paper>
      </Container>

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .mantine-Container-root {
            padding: 30px 10px !important;
          }
          .mantine-Paper-root {
            padding: 20px !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default UserDetailsPage;