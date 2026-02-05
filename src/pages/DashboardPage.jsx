import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Button, Flex, Text } from '@mantine/core';
import { IoHome } from 'react-icons/io5';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const dispatch = useDispatch();

  return (
    <div className='dashboard-page'>
      <h2>Dashboard</h2>
      <p>You are signed in. This is your protected dashboard.</p>
      <button
        type='button'
        onClick={() => dispatch(logout())}
        className='dashboard-logout'
      >
        Sign out
      </button>

      <Link to={'/'}>
        <Flex
          align={'center'}
          px={8}
          py={6}
          bg={'#00000070'}
          gap={4}
          maw={'fit-content'}
          bdrs={6}
          mt={12}
          style={{ cursor: 'pointer' }}
        >
          <IoHome style={{ color: 'white' }} />
          <Text c='white'>Home</Text>
        </Flex>
      </Link>
    </div>
  );
}

export default DashboardPage;
