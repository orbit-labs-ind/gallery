import React from 'react'
import LogoIcon from '../../assets/picpoint_logo.svg';
import { Image, Text } from '@mantine/core';

const Logo = ({size = '30px', color = 'white'}) => {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}>
        <Image src={LogoIcon} width={size} height={size} style={{ width: size, height: size }} />
        <Text size="xl" fw={700} c={color} style={{fontFamily: 'clash display'}}>PicPoint</Text>
    </div>
  )
}

export default Logo