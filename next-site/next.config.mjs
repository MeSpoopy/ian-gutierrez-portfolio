const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/ian-gutierrez-portfolio';
export default {
  output: 'export',
  basePath,
  images: { unoptimized: true },
  poweredByHeader: false,
};
