import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";
import { Review } from "../src/models/mongoose/Review.js";
import { ActivityLog } from "../src/models/mongoose/ActivityLog.js";
import { Notification } from "../src/models/mongoose/Notification.js";
import { ArtistProfile } from "../src/models/mongoose/ArtistProfile.js";

const prisma = new PrismaClient();

export const SEED_IDS = {
  userDemo: "seed-user-demo",
  userAdmin: "seed-user-admin",
  userSeller: "seed-user-seller",
  venueGnp: "seed-venue-gnp",
  venuePalacio: "seed-venue-palacio",
  venueArenaVfg: "seed-venue-arena-vfg",
  venueForoSol: "seed-venue-foro-sol",
  venueArenaMonterrey: "seed-venue-arena-monterrey",
  venueCCUPuebla: "seed-venue-ccu-puebla",
  venueCorregidora: "seed-venue-corregidora",
  venuePoliforumZamna: "seed-venue-poliforum-zamna",
  venueCaliente: "seed-venue-caliente",
  venuePoliforumLeon: "seed-venue-poliforum-leon",
  eventRosalia: "seed-event-rosalia",
  eventFkaTwigs: "seed-event-fka-twigs",
  eventCtangana: "seed-event-ctangana",
  eventWeeknd: "seed-event-weeknd",
  eventAxeCeremonia: "seed-event-axe-ceremonia",
  eventKanye: "seed-event-kanye",
  eventBryantBarnes: "seed-event-bryant-barnes",
  eventNinajirachi: "seed-event-ninajirachi",
  eventJpegmafia: "seed-event-jpegmafia",
  eventTheStrokes: "seed-event-the-strokes",
  eventJamesBlake: "seed-event-james-blake",
  eventKendrickLamar: "seed-event-kendrick-lamar",
  eventGorillaz: "seed-event-gorillaz",
} as const;

async function createSeatsForZone(
  zoneId: string,
  rows: string[],
  seatsPerRow: number,
  soldCount: number
): Promise<void> {
  const seats: {
    id: string;
    zone_id: string;
    row: string;
    number: number;
    status: "available" | "sold";
  }[] = [];
  let sold = 0;

  for (const row of rows) {
    for (let n = 1; n <= seatsPerRow; n++) {
      const isSold = sold < soldCount;
      if (isSold) sold++;
      seats.push({
        id: `seat-${zoneId}-${row}-${n}`,
        zone_id: zoneId,
        row,
        number: n,
        status: isSold ? "sold" : "available",
      });
    }
  }

  await prisma.seat.createMany({ data: seats, skipDuplicates: true });
}

async function seedPostgres(): Promise<void> {
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.info("PostgreSQL already seeded, skipping.");
    return;
  }

  await prisma.resale.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.event.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: SEED_IDS.userDemo,
        name: "Ana García",
        email: "ana.garcia@ejemplo.mx",
        password_hash: "$2b$10$placeholder_hash_demo",
        role: "buyer",
      },
      {
        id: SEED_IDS.userAdmin,
        name: "Admin Stagefront",
        email: "admin@stagefront.mx",
        password_hash: "$2b$10$placeholder_hash_admin",
        role: "admin",
      },
      {
        id: SEED_IDS.userSeller,
        name: "Carlos Mendoza",
        email: "carlos.mendoza@ejemplo.mx",
        password_hash: "$2b$10$placeholder_hash_seller",
        role: "seller",
      },
    ],
  });

  await prisma.venue.createMany({
    data: [
      {
        id: SEED_IDS.venueGnp,
        name: "Estadio GNP Seguros",
        city: "Ciudad de México",
        address: "Av. Insurgentes Sur 2451, Col. Tlalpan",
        capacity: 65000,
      },
      {
        id: SEED_IDS.venuePalacio,
        name: "Palacio de los Deportes",
        city: "Ciudad de México",
        address: "Av. Río Churubusco 205, Col. Country Club",
        capacity: 20000,
      },
      {
        id: SEED_IDS.venueArenaVfg,
        name: "Arena VFG",
        city: "Guadalajara",
        address: "Av. Francisco Silva Romero 2900, Zapopan",
        capacity: 16000,
      },
      {
        id: SEED_IDS.venueForoSol,
        name: "Foro Sol",
        city: "Ciudad de México",
        address: "Av. Río Churubusco, Ciudad Deportiva Magdalena Mixhuca",
        capacity: 65000,
      },
      {
        id: SEED_IDS.venueArenaMonterrey,
        name: "Arena Monterrey",
        city: "Monterrey",
        address: "Av. Francisco I. Madero 2900, Monterrey, N.L.",
        capacity: 18000,
      },
      {
        id: SEED_IDS.venueCCUPuebla,
        name: "Complejo Cultural Universitario",
        city: "Puebla",
        address: "Av. Universidad s/n, San Manuel, Puebla",
        capacity: 15000,
      },
      {
        id: SEED_IDS.venueCorregidora,
        name: "Estadio Corregidora",
        city: "Querétaro",
        address: "Av. de las Artes s/n, Centro Histórico, Querétaro",
        capacity: 33000,
      },
      {
        id: SEED_IDS.venuePoliforumZamna,
        name: "Poliforum Zamna",
        city: "Mérida",
        address: "Carr. Mérida-Progreso Km 6, Mérida, Yuc.",
        capacity: 20000,
      },
      {
        id: SEED_IDS.venueCaliente,
        name: "Estadio Caliente",
        city: "Tijuana",
        address: "Blvd. Agua Caliente 12027, Tijuana, B.C.",
        capacity: 32000,
      },
      {
        id: SEED_IDS.venuePoliforumLeon,
        name: "Poliforum León",
        city: "León",
        address: "Blvd. Torres Landa 1929, León, Gto.",
        capacity: 10000,
      },
    ],
  });

  const events = [
    {
      id: SEED_IDS.eventRosalia,
      title: "Rosalía — Motomami World Tour",
      artist_name: "Rosalía",
      venue_id: SEED_IDS.venuePalacio,
      date: new Date("2026-08-22T21:00:00-06:00"),
      status: "published" as const,
      total_capacity: 18000,
      genre: "Pop / Flamenco",
      description:
        "Rosalía regresa a México con Motomami World Tour. Una experiencia audiovisual sin precedentes que fusiona flamenco, reggaetón y vanguardia en el Palacio de los Deportes de la Ciudad de México.",
      image_url: "/images/rosalia.jpg",
    },
    {
      id: SEED_IDS.eventFkaTwigs,
      title: "FKA Twigs — Body High Tour",
      artist_name: "FKA Twigs",
      venue_id: SEED_IDS.venueArenaVfg,
      date: new Date("2026-09-05T21:30:00-06:00"),
      status: "published" as const,
      total_capacity: 12000,
      genre: "Art Pop / R&B / Electrónica",
      description:
        "FKA Twigs presenta Body High en Guadalajara: una performance inmersiva que mezcla danza contemporánea, tecnología y música experimental. Un show único en su tipo en la Arena VFG.",
      image_url: "/images/fkatwigs.jpg",
    },
    {
      id: SEED_IDS.eventCtangana,
      title: "C. Tangana — Sin Cantar ni Afinar Tour",
      artist_name: "C. Tangana",
      venue_id: SEED_IDS.venueForoSol,
      date: new Date("2026-09-26T20:30:00-06:00"),
      status: "published" as const,
      total_capacity: 50000,
      genre: "Urbano / Flamenco Pop",
      description:
        "El Madrileño llega al Foro Sol con Sin Cantar ni Afinar Tour. C. Tangana trae su mezcla única de flamenco, urbano y pop ibérico a la Ciudad de México en un show histórico.",
      image_url: "/images/ctangana.jpg",
    },
    {
      id: SEED_IDS.eventWeeknd,
      title: "The Weeknd — After Hours Til Dawn Tour",
      artist_name: "The Weeknd",
      venue_id: SEED_IDS.venueGnp,
      date: new Date("2026-10-17T21:00:00-06:00"),
      status: "published" as const,
      total_capacity: 60000,
      genre: "R&B / Pop",
      description:
        "The Weeknd llega al Estadio GNP Seguros con After Hours Til Dawn Tour. La producción más ambiciosa de su carrera: 360° de luces, pantallas y el mejor show de R&B del planeta.",
      image_url: "/images/theweeknd.jpg",
    },
    {
      id: SEED_IDS.eventAxeCeremonia,
      title: "Axe Ceremonia 2027",
      artist_name: "Rosalía · C. Tangana · FKA Twigs · Villano Antillano",
      venue_id: SEED_IDS.venueForoSol,
      date: new Date("2027-04-17T14:00:00-06:00"),
      status: "published" as const,
      total_capacity: 55000,
      genre: "Festival / Urbano / Pop / Electrónica",
      description:
        "El festival más importante de música alternativa en México regresa al Foro Sol. Axe Ceremonia 2027 reúne a los artistas más relevantes de la escena latina e internacional en un día épico.",
      image_url: "/images/axeceremonia.jpg",
    },
    {
      id: SEED_IDS.eventKanye,
      title: "Kanye West: Ye Live in Mexico",
      artist_name: "Kanye West",
      venue_id: SEED_IDS.venueGnp,
      date: new Date("2027-02-20T21:00:00-06:00"),
      status: "published" as const,
      total_capacity: 65000,
      genre: "Hip-Hop / Rap",
      description:
        "El evento más esperado de la década. Kanye West se presenta por primera vez en México en el Estadio GNP Seguros con Ye Live: una experiencia audiovisual masiva que redefine el concepto de show en vivo.",
      image_url: "/images/kanyewest.jpg",
    },
    {
      id: SEED_IDS.eventBryantBarnes,
      title: "Bryant Barnes — Closer to Midnight",
      artist_name: "Bryant Barnes",
      venue_id: SEED_IDS.venueArenaMonterrey,
      date: new Date("2026-10-11T21:00:00-06:00"),
      status: "published" as const,
      total_capacity: 14000,
      genre: "R&B / Soul",
      description:
        "Bryant Barnes debuta en México con su gira Closer to Midnight. El cantante y productor californiano lleva su sonido de R&B contemporáneo al norte del país en la Arena Monterrey.",
      image_url: "/images/bryantbarnes.avif",
    },
    {
      id: SEED_IDS.eventNinajirachi,
      title: "Ninajirachi — Wishing Well Tour",
      artist_name: "Ninajirachi",
      venue_id: SEED_IDS.venueArenaVfg,
      date: new Date("2026-11-08T22:00:00-06:00"),
      status: "published" as const,
      total_capacity: 8000,
      genre: "Electrónica / Hyperpop",
      description:
        "La productora australiana Ninajirachi llega a Guadalajara con Wishing Well Tour. Sus sets electrónicos y hyperpop toman la Arena VFG para una noche de baile sin parar.",
      image_url: "/images/ninajirachi.avif",
    },
    {
      id: SEED_IDS.eventJpegmafia,
      title: "JPEGMAFIA — Scaring The Hoes World Tour",
      artist_name: "JPEGMAFIA",
      venue_id: SEED_IDS.venueCaliente,
      date: new Date("2026-09-19T21:30:00-06:00"),
      status: "published" as const,
      total_capacity: 10000,
      genre: "Experimental Hip-Hop",
      description:
        "JPEGMAFIA lleva su caos organizado a Tijuana. El rapper y productor de Baltimore presenta Scaring The Hoes World Tour en el Estadio Caliente con uno de los shows más intensos del rap alternativo.",
      image_url: "/images/jpegmafia.jpg",
    },
    {
      id: SEED_IDS.eventTheStrokes,
      title: "The Strokes — Is This It Again? Tour",
      artist_name: "The Strokes",
      venue_id: SEED_IDS.venueCCUPuebla,
      date: new Date("2026-10-24T21:00:00-06:00"),
      status: "published" as const,
      total_capacity: 12000,
      genre: "Rock / Indie",
      description:
        "The Strokes regresan a México con Is This It Again? Tour. Los neoyorkinos tocan en Puebla en el CCU con sus clásicos de Is This It y Room on Fire junto a material nuevo.",
      image_url: "/images/thestrokes.jpeg",
    },
    {
      id: SEED_IDS.eventJamesBlake,
      title: "James Blake — Playing Robots Into Heaven Tour",
      artist_name: "James Blake",
      venue_id: SEED_IDS.venueCorregidora,
      date: new Date("2026-11-22T21:00:00-06:00"),
      status: "published" as const,
      total_capacity: 8000,
      genre: "Electronic Soul / Post-Dubstep",
      description:
        "James Blake presenta Playing Robots Into Heaven Tour en Querétaro. El productor y cantante británico lleva su más reciente álbum de clubes y electrónica al Estadio Corregidora en una noche íntima e intensa.",
      image_url: "/images/jamesblake.jpg",
    },
    {
      id: SEED_IDS.eventKendrickLamar,
      title: "Kendrick Lamar — Grand National Tour",
      artist_name: "Kendrick Lamar",
      venue_id: SEED_IDS.venuePoliforumLeon,
      date: new Date("2027-01-30T21:00:00-06:00"),
      status: "published" as const,
      total_capacity: 10000,
      genre: "Hip-Hop / Rap",
      description:
        "Kendrick Lamar trae el Grand National Tour a León. El rapero de Compton, ganador del Pulitzer, lleva GNX y su catálogo completo al Poliforum León en una noche histórica para el hip-hop en México.",
      image_url: "/images/kendricklamar.jpg",
    },
    {
      id: SEED_IDS.eventGorillaz,
      title: "Gorillaz — Cracker Island Tour",
      artist_name: "Gorillaz",
      venue_id: SEED_IDS.venuePoliforumZamna,
      date: new Date("2026-12-05T20:30:00-06:00"),
      status: "published" as const,
      total_capacity: 18000,
      genre: "Alternative / Electronic",
      description:
        "Gorillaz desembarcan en Mérida con Cracker Island Tour. La banda virtual de Damon Albarn presenta su show multimedia en el Poliforum Zamna con invitados especiales y una puesta en escena inigualable.",
      image_url: "/images/gorillaz.jpg",
    },
  ];

  await prisma.event.createMany({ data: events });

  const zones = [
    // Rosalía — Palacio de los Deportes
    { id: "zone-ro-general", event_id: SEED_IDS.eventRosalia, name: "Pista General", price: 1650, total_seats: 150, available_seats: 88 },
    { id: "zone-ro-vip",     event_id: SEED_IDS.eventRosalia, name: "VIP",           price: 3800, total_seats: 60,  available_seats: 24 },
    { id: "zone-ro-palco",   event_id: SEED_IDS.eventRosalia, name: "Palco Premium", price: 6500, total_seats: 30,  available_seats: 6  },
    { id: "zone-ro-tribuna", event_id: SEED_IDS.eventRosalia, name: "Tribuna",       price: 980,  total_seats: 200, available_seats: 145 },

    // FKA Twigs — Arena VFG
    { id: "zone-ft-general", event_id: SEED_IDS.eventFkaTwigs, name: "Pista",        price: 1400, total_seats: 120, available_seats: 75 },
    { id: "zone-ft-vip",     event_id: SEED_IDS.eventFkaTwigs, name: "VIP",          price: 3200, total_seats: 50,  available_seats: 18 },
    { id: "zone-ft-tribuna", event_id: SEED_IDS.eventFkaTwigs, name: "Tribuna",      price: 850,  total_seats: 180, available_seats: 130 },

    // C. Tangana — Foro Sol
    { id: "zone-ct-general", event_id: SEED_IDS.eventCtangana, name: "Pista General", price: 1750, total_seats: 200, available_seats: 122 },
    { id: "zone-ct-vip",     event_id: SEED_IDS.eventCtangana, name: "VIP",           price: 4200, total_seats: 80,  available_seats: 31 },
    { id: "zone-ct-palco",   event_id: SEED_IDS.eventCtangana, name: "Palco Premium", price: 7200, total_seats: 40,  available_seats: 9  },
    { id: "zone-ct-tribuna", event_id: SEED_IDS.eventCtangana, name: "Tribuna Alta",  price: 1100, total_seats: 300, available_seats: 218 },

    // The Weeknd — Estadio GNP
    { id: "zone-tw-general", event_id: SEED_IDS.eventWeeknd, name: "Pista General", price: 2100, total_seats: 250, available_seats: 160 },
    { id: "zone-tw-vip",     event_id: SEED_IDS.eventWeeknd, name: "VIP",           price: 5500, total_seats: 100, available_seats: 38 },
    { id: "zone-tw-palco",   event_id: SEED_IDS.eventWeeknd, name: "Palco Premium", price: 9500, total_seats: 40,  available_seats: 5  },
    { id: "zone-tw-tribuna", event_id: SEED_IDS.eventWeeknd, name: "Tribuna",       price: 1300, total_seats: 350, available_seats: 260 },

    // Axe Ceremonia — Foro Sol
    { id: "zone-ax-general", event_id: SEED_IDS.eventAxeCeremonia, name: "Zona General",   price: 1500, total_seats: 300, available_seats: 195 },
    { id: "zone-ax-vip",     event_id: SEED_IDS.eventAxeCeremonia, name: "Zona VIP",       price: 3500, total_seats: 120, available_seats: 52 },
    { id: "zone-ax-ultra",   event_id: SEED_IDS.eventAxeCeremonia, name: "Ultra VIP",      price: 6000, total_seats: 60,  available_seats: 14 },

    // Kanye West — Estadio GNP
    { id: "zone-kw-general", event_id: SEED_IDS.eventKanye, name: "Pista General", price: 2800, total_seats: 300, available_seats: 190 },
    { id: "zone-kw-vip",     event_id: SEED_IDS.eventKanye, name: "VIP",           price: 7000, total_seats: 100, available_seats: 42 },
    { id: "zone-kw-palco",   event_id: SEED_IDS.eventKanye, name: "Palco Premium", price: 12000, total_seats: 40, available_seats: 8  },
    { id: "zone-kw-tribuna", event_id: SEED_IDS.eventKanye, name: "Tribuna",       price: 1600, total_seats: 400, available_seats: 295 },

    // Bryant Barnes — Arena Monterrey
    { id: "zone-bb-general", event_id: SEED_IDS.eventBryantBarnes, name: "Pista General", price: 950,  total_seats: 150, available_seats: 110 },
    { id: "zone-bb-vip",     event_id: SEED_IDS.eventBryantBarnes, name: "VIP",           price: 2400, total_seats: 60,  available_seats: 35 },
    { id: "zone-bb-tribuna", event_id: SEED_IDS.eventBryantBarnes, name: "Tribuna",       price: 650,  total_seats: 200, available_seats: 162 },

    // Ninajirachi — Arena VFG
    { id: "zone-nj-general", event_id: SEED_IDS.eventNinajirachi, name: "Pista",    price: 800,  total_seats: 200, available_seats: 155 },
    { id: "zone-nj-vip",     event_id: SEED_IDS.eventNinajirachi, name: "VIP",      price: 1800, total_seats: 80,  available_seats: 48 },
    { id: "zone-nj-premium", event_id: SEED_IDS.eventNinajirachi, name: "Premium",  price: 3200, total_seats: 40,  available_seats: 21 },

    // JPEGMAFIA — Estadio Caliente
    { id: "zone-jp-general", event_id: SEED_IDS.eventJpegmafia, name: "Pista General", price: 750,  total_seats: 180, available_seats: 130 },
    { id: "zone-jp-vip",     event_id: SEED_IDS.eventJpegmafia, name: "VIP",           price: 1900, total_seats: 60,  available_seats: 29 },
    { id: "zone-jp-tribuna", event_id: SEED_IDS.eventJpegmafia, name: "Tribuna",       price: 500,  total_seats: 220, available_seats: 178 },

    // The Strokes — CCU Puebla
    { id: "zone-ts-general", event_id: SEED_IDS.eventTheStrokes, name: "Pista General", price: 1100, total_seats: 160, available_seats: 98 },
    { id: "zone-ts-vip",     event_id: SEED_IDS.eventTheStrokes, name: "VIP",           price: 2800, total_seats: 70,  available_seats: 33 },
    { id: "zone-ts-tribuna", event_id: SEED_IDS.eventTheStrokes, name: "Tribuna",       price: 750,  total_seats: 250, available_seats: 195 },

    // James Blake — Estadio Corregidora
    { id: "zone-jb-general", event_id: SEED_IDS.eventJamesBlake, name: "Pista",    price: 900,  total_seats: 120, available_seats: 88 },
    { id: "zone-jb-vip",     event_id: SEED_IDS.eventJamesBlake, name: "VIP",      price: 2200, total_seats: 50,  available_seats: 22 },
    { id: "zone-jb-tribuna", event_id: SEED_IDS.eventJamesBlake, name: "Tribuna",  price: 600,  total_seats: 180, available_seats: 145 },

    // Kendrick Lamar — Poliforum León
    { id: "zone-kl-general", event_id: SEED_IDS.eventKendrickLamar, name: "Pista General", price: 1800, total_seats: 200, available_seats: 78 },
    { id: "zone-kl-vip",     event_id: SEED_IDS.eventKendrickLamar, name: "VIP",           price: 4500, total_seats: 80,  available_seats: 12 },
    { id: "zone-kl-palco",   event_id: SEED_IDS.eventKendrickLamar, name: "Palco Premium", price: 8000, total_seats: 30,  available_seats: 3  },
    { id: "zone-kl-tribuna", event_id: SEED_IDS.eventKendrickLamar, name: "Tribuna",       price: 1100, total_seats: 300, available_seats: 215 },

    // Gorillaz — Poliforum Zamna
    { id: "zone-go-general", event_id: SEED_IDS.eventGorillaz, name: "Zona General", price: 1300, total_seats: 250, available_seats: 172 },
    { id: "zone-go-vip",     event_id: SEED_IDS.eventGorillaz, name: "VIP",          price: 3200, total_seats: 100, available_seats: 44 },
    { id: "zone-go-ultra",   event_id: SEED_IDS.eventGorillaz, name: "Ultra VIP",    price: 5500, total_seats: 40,  available_seats: 11 },
    { id: "zone-go-tribuna", event_id: SEED_IDS.eventGorillaz, name: "Tribuna",      price: 850,  total_seats: 300, available_seats: 238 },
  ];

  await prisma.zone.createMany({ data: zones });

  // Seats
  await createSeatsForZone("zone-ro-general", ["A", "B", "C"], 50, 62);
  await createSeatsForZone("zone-ro-vip",     ["V1", "V2"],    30, 36);
  await createSeatsForZone("zone-ro-palco",   ["P1"],          30, 24);
  await createSeatsForZone("zone-ro-tribuna", ["T1", "T2", "T3", "T4"], 50, 55);

  await createSeatsForZone("zone-ft-general", ["A", "B", "C"], 40, 45);
  await createSeatsForZone("zone-ft-vip",     ["V1"],          50, 32);
  await createSeatsForZone("zone-ft-tribuna", ["T1", "T2", "T3"], 60, 50);

  await createSeatsForZone("zone-ct-general", ["A", "B", "C", "D"], 50, 78);
  await createSeatsForZone("zone-ct-vip",     ["V1", "V2"],          40, 49);
  await createSeatsForZone("zone-ct-palco",   ["P1"],                40, 31);
  await createSeatsForZone("zone-ct-tribuna", ["T1", "T2", "T3"],   100, 82);

  await createSeatsForZone("zone-tw-general", ["A", "B", "C", "D", "E"], 50, 90);
  await createSeatsForZone("zone-tw-vip",     ["V1", "V2"],              50, 62);
  await createSeatsForZone("zone-tw-palco",   ["P1"],                    40, 35);
  await createSeatsForZone("zone-tw-tribuna", ["T1", "T2", "T3", "T4", "T5"], 70, 90);

  await createSeatsForZone("zone-ax-general", ["A", "B", "C", "D", "E", "F"], 50, 105);
  await createSeatsForZone("zone-ax-vip",     ["V1", "V2"],                   60, 68);
  await createSeatsForZone("zone-ax-ultra",   ["U1"],                         60, 46);

  await createSeatsForZone("zone-kw-general", ["A", "B", "C", "D", "E", "F"], 50, 110);
  await createSeatsForZone("zone-kw-vip",     ["V1", "V2"],                   50, 58);
  await createSeatsForZone("zone-kw-palco",   ["P1"],                         40, 32);
  await createSeatsForZone("zone-kw-tribuna", ["T1", "T2", "T3", "T4"],      100, 105);

  await createSeatsForZone("zone-bb-general", ["A", "B", "C"], 50, 40);
  await createSeatsForZone("zone-bb-vip",     ["V1"],          60, 25);
  await createSeatsForZone("zone-bb-tribuna", ["T1", "T2"],   100, 38);

  await createSeatsForZone("zone-nj-general", ["A", "B", "C", "D"], 50, 45);
  await createSeatsForZone("zone-nj-vip",     ["V1", "V2"],          40, 32);
  await createSeatsForZone("zone-nj-premium", ["P1"],                40, 19);

  await createSeatsForZone("zone-jp-general", ["A", "B", "C"], 60, 50);
  await createSeatsForZone("zone-jp-vip",     ["V1"],           60, 31);
  await createSeatsForZone("zone-jp-tribuna", ["T1", "T2", "T3"], 74, 42);

  await createSeatsForZone("zone-ts-general", ["A", "B", "C", "D"], 40, 62);
  await createSeatsForZone("zone-ts-vip",     ["V1", "V2"],          35, 37);
  await createSeatsForZone("zone-ts-tribuna", ["T1", "T2", "T3"],    83, 55);

  await createSeatsForZone("zone-jb-general", ["A", "B", "C"], 40, 32);
  await createSeatsForZone("zone-jb-vip",     ["V1"],           50, 28);
  await createSeatsForZone("zone-jb-tribuna", ["T1", "T2", "T3"], 60, 35);

  await createSeatsForZone("zone-kl-general", ["A", "B", "C", "D"], 50, 122);
  await createSeatsForZone("zone-kl-vip",     ["V1", "V2"],          40, 68);
  await createSeatsForZone("zone-kl-palco",   ["P1"],                30, 27);
  await createSeatsForZone("zone-kl-tribuna", ["T1", "T2", "T3"],   100, 85);

  await createSeatsForZone("zone-go-general", ["A", "B", "C", "D", "E"], 50, 78);
  await createSeatsForZone("zone-go-vip",     ["V1", "V2"],               50, 56);
  await createSeatsForZone("zone-go-ultra",   ["U1"],                     40, 29);
  await createSeatsForZone("zone-go-tribuna", ["T1", "T2", "T3"],        100, 62);

  // Sample order
  const soldSeat = await prisma.seat.findFirst({
    where: { zone_id: "zone-ro-general", status: "sold" },
  });

  if (soldSeat) {
    const secondSeat = await prisma.seat.findFirst({
      where: { zone_id: "zone-ro-general", status: "sold", id: { not: soldSeat.id } },
    });

    if (secondSeat) {
      await prisma.order.create({
        data: {
          user_id: SEED_IDS.userDemo,
          event_id: SEED_IDS.eventRosalia,
          total: 3300,
          status: "confirmed",
          order_items: {
            create: [
              { seat_id: soldSeat.id, price: 1650 },
              { seat_id: secondSeat.id, price: 1650 },
            ],
          },
        },
      });

      await prisma.resale.create({
        data: {
          seat_id: soldSeat.id,
          seller_id: SEED_IDS.userSeller,
          price: 2100,
          status: "active",
        },
      });
    }

    const weekndSeat = await prisma.seat.findFirst({
      where: { zone_id: "zone-tw-general", status: "sold" },
    });

    if (weekndSeat) {
      await prisma.order.create({
        data: {
          user_id: SEED_IDS.userDemo,
          event_id: SEED_IDS.eventWeeknd,
          total: 2100,
          status: "pending",
          order_items: { create: { seat_id: weekndSeat.id, price: 2100 } },
        },
      });
    }
  }

  const gorillazSeat = await prisma.seat.findFirst({
    where: { zone_id: "zone-go-vip", status: "sold" },
  });

  if (gorillazSeat) {
    await prisma.order.create({
      data: {
        user_id: SEED_IDS.userSeller,
        event_id: SEED_IDS.eventGorillaz,
        total: 3200,
        status: "confirmed",
        order_items: { create: { seat_id: gorillazSeat.id, price: 3200 } },
      },
    });

    await prisma.resale.create({
      data: {
        seat_id: gorillazSeat.id,
        seller_id: SEED_IDS.userSeller,
        price: 4100,
        status: "active",
      },
    });
  }
}

async function seedMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");

  await mongoose.connect(uri);

  const existing = await ArtistProfile.countDocuments();
  if (existing > 0) {
    console.info("MongoDB already seeded, skipping.");
    await mongoose.disconnect();
    return;
  }

  await Review.deleteMany({});
  await ActivityLog.deleteMany({});
  await Notification.deleteMany({});
  await ArtistProfile.deleteMany({});

  await ArtistProfile.insertMany([
    {
      name: "Rosalía",
      bio: "Cantante y compositora española que fusiona el flamenco con el pop, el reggaetón y la electrónica. Ganadora de múltiples Grammy con su álbum Motomami.",
      genres: ["Pop", "Flamenco", "Reggaetón", "Electrónica"],
      social_links: { instagram: "@rosalia.vt", spotify: "Rosalía", youtube: "RosaliaVEVO" },
      media: ["https://picsum.photos/seed/artist-rosalia/800/800"],
    },
    {
      name: "FKA Twigs",
      bio: "Artista multidisciplinar británica. Sus shows combinan danza de pole, artes marciales, voz etérea y producción electrónica en performances únicas en el mundo.",
      genres: ["Art Pop", "R&B", "Electrónica", "Experimental"],
      social_links: { instagram: "@fkatwigs", spotify: "FKA twigs" },
      media: ["https://picsum.photos/seed/artist-fkatwigs/800/800"],
    },
    {
      name: "C. Tangana",
      bio: "Artista madrileño que mezcla el urbano español con el flamenco, la rumba y el pop ibérico. Su álbum El Madrileño lo catapultó a la escena global.",
      genres: ["Urbano", "Flamenco Pop", "Rumba", "R&B"],
      social_links: { instagram: "@c.tangana", spotify: "C. Tangana" },
      media: ["https://picsum.photos/seed/artist-ctangana/800/800"],
    },
    {
      name: "The Weeknd",
      bio: "Abel Tesfaye, conocido como The Weeknd, es uno de los artistas de R&B más influyentes de su generación. After Hours Til Dawn es su gira más ambiciosa hasta la fecha.",
      genres: ["R&B", "Pop", "Synth-pop", "Dark Pop"],
      social_links: { instagram: "@theweeknd", spotify: "The Weeknd", youtube: "TheWeekndVEVO" },
      media: ["https://picsum.photos/seed/artist-weeknd/800/800"],
    },
    {
      name: "Kanye West",
      bio: "Productor, rapero y diseñador. Una de las figuras más influyentes de la música contemporánea. Ye Live es una experiencia audiovisual que trasciende el concepto de concierto.",
      genres: ["Hip-Hop", "Rap", "Gospel Rap", "Experimental"],
      social_links: { instagram: "@kanyewest", spotify: "Kanye West" },
      media: ["https://picsum.photos/seed/artist-kanye/800/800"],
    },
    {
      name: "Axe Ceremonia",
      bio: "El festival de música alternativa más importante de México, celebrado anualmente en el Foro Sol. Reúne a los artistas más relevantes de la escena latina e internacional.",
      genres: ["Festival", "Alternativo", "Electrónica", "Urbano", "Pop"],
      social_links: { instagram: "@axeceremonia", twitter: "@AxeCeremonia" },
      media: ["https://picsum.photos/seed/axe-ceremonia/800/800"],
    },
    {
      name: "Bryant Barnes",
      bio: "Cantante y productor de R&B contemporáneo originario de Los Ángeles. Su sonido mezcla soul clásico con producción moderna y letras introspectivas que lo han posicionado como una de las voces más prometedoras de su generación.",
      genres: ["R&B", "Soul", "Neo-Soul"],
      social_links: { instagram: "@bryantbarnes", spotify: "Bryant Barnes" },
      media: ["https://picsum.photos/seed/artist-bryantbarnes/800/800"],
    },
    {
      name: "Ninajirachi",
      bio: "Productora y DJ australiana especializada en electrónica y hyperpop. Conocida por sus sets de alta energía y producciones que mezclan dance pop con elementos experimentales. Uno de los talentos más frescos de la escena electrónica mundial.",
      genres: ["Electrónica", "Hyperpop", "Dance", "Club"],
      social_links: { instagram: "@ninajirachi", spotify: "Ninajirachi" },
      media: ["https://picsum.photos/seed/artist-ninajirachi/800/800"],
    },
    {
      name: "JPEGMAFIA",
      bio: "Rapper y productor de Baltimore reconocido por su estilo experimental e irreverente. Sus álbumes Veteran y Scaring The Hoes lo consolidaron como una figura clave del hip-hop alternativo global.",
      genres: ["Experimental Hip-Hop", "Noise Rap", "Industrial"],
      social_links: { instagram: "@jpegmafia", spotify: "JPEGMAFIA" },
      media: ["https://picsum.photos/seed/artist-jpegmafia/800/800"],
    },
    {
      name: "The Strokes",
      bio: "Banda de rock indie neoyorkina formada en 1998. Su álbum debut Is This It (2001) redefinió el rock del siglo XXI. Iconos indiscutibles del indie rock con una discografía que abarca más de dos décadas de influencia global.",
      genres: ["Indie Rock", "Post-Punk Revival", "Alternative Rock"],
      social_links: { instagram: "@thestrokes", spotify: "The Strokes" },
      media: ["https://picsum.photos/seed/artist-thestrokes/800/800"],
    },
    {
      name: "James Blake",
      bio: "Productor y cantante británico pionero del post-dubstep y la electrónica introspectiva. Con álbumes como James Blake, Overgrown y Playing Robots Into Heaven ha redefinido las fronteras entre el pop, el soul y la música electrónica.",
      genres: ["Electronic Soul", "Post-Dubstep", "Art Pop", "Ambient"],
      social_links: { instagram: "@jamesblake", spotify: "James Blake" },
      media: ["https://picsum.photos/seed/artist-jamesblake/800/800"],
    },
    {
      name: "Kendrick Lamar",
      bio: "Rapper de Compton, California, considerado uno de los mayores poetas del hip-hop contemporáneo. Ganador del Premio Pulitzer por DAMN. (2018), su álbum GNX y su actuación en el Super Bowl LIX lo reafirmaron como la voz más importante del rap actual.",
      genres: ["Hip-Hop", "Rap", "Conscious Rap", "West Coast"],
      social_links: { instagram: "@kendricklamar", spotify: "Kendrick Lamar" },
      media: ["https://picsum.photos/seed/artist-kendricklamar/800/800"],
    },
    {
      name: "Gorillaz",
      bio: "Banda virtual creada por Damon Albarn y Jamie Hewlett en 1998. Sus shows en vivo combinan actuaciones en pantalla de sus personajes animados con músicos reales e invitados especiales. Cracker Island es su álbum más reciente.",
      genres: ["Alternative", "Electronic", "Trip-Hop", "Britpop"],
      social_links: { instagram: "@gorillaz", spotify: "Gorillaz" },
      media: ["https://picsum.photos/seed/artist-gorillaz/800/800"],
    },
  ]);

  await Review.insertMany([
    {
      user_id: SEED_IDS.userDemo,
      event_id: SEED_IDS.eventRosalia,
      rating: 5,
      comment: "La producción fue increíble. Rosalía estuvo dos horas sin parar, cada canción mejor que la anterior.",
      created_at: new Date("2025-09-01"),
    },
    {
      user_id: SEED_IDS.userSeller,
      event_id: SEED_IDS.eventRosalia,
      rating: 5,
      comment: "El mejor concierto que he visto en mi vida. Vale absolutamente cada peso.",
      created_at: new Date("2025-09-02"),
    },
    {
      user_id: SEED_IDS.userAdmin,
      event_id: SEED_IDS.eventWeeknd,
      rating: 5,
      comment: "After Hours Til Dawn en el GNP fue histórico. La pantalla circular de 360° es algo que no se olvida.",
      created_at: new Date("2025-10-20"),
    },
    {
      user_id: SEED_IDS.userDemo,
      event_id: SEED_IDS.eventCtangana,
      rating: 4,
      comment: "C. Tangana en el Foro Sol fue una noche brutal. El Madrileño sonó diferente en vivo.",
      created_at: new Date("2025-09-28"),
    },
  ]);

  await ActivityLog.insertMany([
    {
      user_id: SEED_IDS.userDemo,
      action: "order_placed",
      metadata: { event_id: SEED_IDS.eventRosalia, total: 3300 },
      timestamp: new Date(),
    },
    {
      user_id: SEED_IDS.userDemo,
      action: "review_created",
      metadata: { event_id: SEED_IDS.eventRosalia },
      timestamp: new Date(),
    },
    {
      user_id: SEED_IDS.userSeller,
      action: "resale_listed",
      metadata: { event_id: SEED_IDS.eventRosalia, price: 2100 },
      timestamp: new Date(),
    },
  ]);

  await Notification.insertMany([
    {
      user_id: SEED_IDS.userDemo,
      type: "order_confirmed",
      message: "Tu pedido para Rosalía — Motomami World Tour fue confirmado. ¡Nos vemos en el Palacio!",
      read: false,
      created_at: new Date(),
    },
    {
      user_id: SEED_IDS.userDemo,
      type: "event_reminder",
      message: "Faltan 7 días para The Weeknd — After Hours Til Dawn Tour en el Estadio GNP.",
      read: false,
      created_at: new Date(),
    },
    {
      user_id: SEED_IDS.userAdmin,
      type: "system",
      message: "Pico de ventas detectado: zona VIP Kanye West agotada en menos de 2 horas.",
      read: true,
      created_at: new Date(),
    },
    {
      user_id: SEED_IDS.userSeller,
      type: "resale_alert",
      message: "Tu reventa de Rosalía (zona General) tiene 3 compradores interesados.",
      read: false,
      created_at: new Date(),
    },
  ]);

  await mongoose.disconnect();
}

async function main(): Promise<void> {
  console.info("Seeding PostgreSQL...");
  await seedPostgres();
  console.info("Seeding MongoDB...");
  await seedMongo();
  console.info("Seed completado.");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
