/** @type {import('next').NextConfig} */
const { join } = require('path');
const { promises: fs } = require('fs');

module.exports = {
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js'
      }
    ];
  }
};

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
  });


const nextConfig = {
    reactStrictMode: true,
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=3600, must-revalidate',
            },
          ],
        },
      ]
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        };
      }
      return config;
    },
  }
  
  module.exports = nextConfig
  module.exports = withPWA