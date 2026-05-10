import { Movie } from './types';

export const CATEGORIES = [
  "أفضل الاختيارات",
  "الأفلام المضافة حديثاً",
  "أفلام الحركة",
  "أفلام الرعب",
  "أفلام الكوميديا",
  "أفلام الخيال العلمي",
  "مسلسلات تلفزيونية"
];

export const MOCK_MOVIES: Movie[] = [
  {
    id: "1",
    title: "The Adam Project",
    description: "After accidentally crash-landing in 2022, time-traveling fighter pilot Adam Reed teams up with his 12-year-old self on a mission to save the future.",
    rating: 7.8,
    year: "2022",
    genre: ["Action", "Sci-Fi", "Comedy"],
    bannerUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=2000",
    thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600",
    duration: "1h 46m"
  },
  {
    id: "2",
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    rating: 8.7,
    year: "2014",
    genre: ["Sci-Fi", "Drama", "Adventure"],
    bannerUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=2000",
    thumbnailUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=600",
    duration: "2h 49m"
  },
  {
    id: "3",
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    rating: 9.0,
    year: "2008",
    genre: ["Action", "Crime", "Drama"],
    bannerUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=2000",
    thumbnailUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=600",
    duration: "2h 32m"
  },
  {
    id: "4",
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    rating: 8.8,
    year: "2010",
    genre: ["Action", "Sci-Fi", "Adventure"],
    bannerUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=2000",
    thumbnailUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=600",
    duration: "2h 28m"
  },
  {
    id: "5",
    title: "Spider-Man: No Way Home",
    description: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.",
    rating: 8.2,
    year: "2021",
    genre: ["Action", "Adventure", "Sci-Fi"],
    bannerUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=2000",
    thumbnailUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=600",
    duration: "2h 28m"
  }
];
