import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Stack,
  Button,
  Switch,
} from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import Logo from '../../assets/images/Logo.png';
import DownloadThumb from '../../assets/images/footer image.png';

const footerLinkSx = {
  color: 'rgba(255,255,255,0.84)',
  textDecoration: 'none',
  fontSize: { xs: '0.9rem', md: '0.95rem' },
  lineHeight: 1.55,
  transition: 'color 0.25s ease',
  '&:hover': {
    color: '#ffffff',
  },
};

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: 'radial-gradient(130% 150% at 50% 0%, #343434 0%, #222222 55%, #1c1c1c 100%)',
        color: '#ffffff',
        pt: { xs: 4, md: 5 },
        pb: { xs: 2.25, md: 2.75 },
        fontFamily: 'Poppins, "Segoe UI", sans-serif',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={{ xs: 2, md: 1.5 }} alignItems="center" sx={{ mb: { xs: 3, md: 3.5 } }}>
          <Typography
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              fontSize: { xs: '1.6rem', md: '2.75rem' },
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            a way to live. a way to be.
          </Typography>

          <Box
            component="img"
            src={Logo}
            alt="Cohopers"
            sx={{
              width: { xs: 100, md: 125 },
              height: 'auto',
              borderRadius: '2px',
              objectFit: 'contain',
            }}
          />
        </Stack>

        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="flex-start" sx={{ mb: { xs: 3, md: 3.75 } }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontSize: { xs: '1.3rem', md: '1.6rem' }, fontWeight: 700, mb: 1.1 }}>Follow Us</Typography>
            <Stack spacing={0.85}>
              <Link href="https://www.linkedin.com" target="_blank" rel="noreferrer" sx={footerLinkSx}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LinkedInIcon sx={{ fontSize: 16 }} />
                  <span>LinkedIn</span>
                </Stack>
              </Link>
              <Link href="https://www.instagram.com" target="_blank" rel="noreferrer" sx={footerLinkSx}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <InstagramIcon sx={{ fontSize: 16 }} />
                  <span>Instagram</span>
                </Stack>
              </Link>
              <Link href="https://x.com" target="_blank" rel="noreferrer" sx={footerLinkSx}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <XIcon sx={{ fontSize: 14 }} />
                  <span>X</span>
                </Stack>
              </Link>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontSize: { xs: '1.3rem', md: '1.6rem' }, fontWeight: 700, mb: 1.1 }}>Pages</Typography>
            <Stack spacing={0.45}>
              {['About', 'Services', 'Gallery', 'Pricing', 'Contact'].map((label) => (
                <Link key={label} href="#" sx={footerLinkSx}>
                  {label}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography sx={{ fontSize: { xs: '1.3rem', md: '1.6rem' }, fontWeight: 700, mb: 1.1 }}>Contact</Typography>
            <Stack spacing={0.8}>
              <Typography sx={{ ...footerLinkSx, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CallOutlinedIcon sx={{ fontSize: 15 }} />
                (+91) 83288 30398
              </Typography>
              <Typography sx={footerLinkSx}>info@cohopers.in</Typography>
              <Typography sx={{ ...footerLinkSx, maxWidth: 330, lineHeight: 1.45 }}>
                630, DLF CYBERCITY, PATIA
                <br />
                BHUBANESWAR, ODISHA-751024
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography sx={{ fontSize: { xs: '1.3rem', md: '1.6rem' }, fontWeight: 700, mb: 1.1 }}>Download App</Typography>
            <Typography sx={{ ...footerLinkSx, mb: 1.2 }}>Get the Cohopers app</Typography>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(90deg, #0f4be7 0%, #1436a8 100%)',
                color: '#fff',
                borderRadius: '10px',
                px: 0.8,
                py: 0.65,
                width: '100%',
                minWidth: 0,
                maxWidth: 190,
                justifyContent: 'flex-start',
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(4, 34, 135, 0.45)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #1d58f0 0%, #1a45bf 100%)',
                },
              }}
            >
              <Box
                component="img"
                src={DownloadThumb}
                alt="Download"
                sx={{ width: 56, height: 28, borderRadius: '4px', objectFit: 'cover', mr: 0.9 }}
              />
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>Download Now</Typography>
            </Button>
          </Grid>
        </Grid>

        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.11)',
            pt: { xs: 1.7, md: 2.1 },
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: { xs: 'flex-start', lg: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.2, lg: 1.8 },
          }}
        >
          <Typography sx={{ ...footerLinkSx, display: 'flex', alignItems: 'center', gap: 0.85 }}>
            <LocalPhoneOutlinedIcon sx={{ color: '#0f52ff', fontSize: 22 }} />
            © 2024 Cohopers. All Rights Reserved
          </Typography>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 0.75, md: 2 }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={footerLinkSx}>Theme:</Typography>
              <Switch size="small" checked={false} disabled sx={{ opacity: 0.7 }} />
              <Typography sx={footerLinkSx}>(Manual)</Typography>
            </Stack>
            {['Blog', 'Careers', 'Contact Us', 'Privacy Policy', 'Terms & Conditions'].map((item) => (
              <Link key={item} href="#" sx={footerLinkSx}>
                {item}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;