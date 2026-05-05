import { db, schema } from "./index";

const seedData = [
  {
    pro: {
      slug: "ana-pilar",
      name: "Ana Pilar",
      discipline: "yoga" as const,
      city: "Bariloche",
      bio: "Profesora de Vinyasa y Hatha hace 12 años. Formada en Mysore, India. Trabaja con grupos pequeños desde su estudio en Llao Llao mirando el lago. Foco: alineación, respiración, presencia.",
      avatarUrl:
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=1600&q=80",
    },
    plans: [
      {
        slug: "drop-in",
        name: "Drop-in mensual",
        description: "Una clase por semana, ideal si querés probar.",
        pricePerMonth: 18000,
        featured: 0,
      },
      {
        slug: "ilimitado",
        name: "Mensual ilimitado",
        description: "Todas las clases del mes en grupo. Hasta 4 por semana.",
        pricePerMonth: 32000,
        featured: 1,
      },
      {
        slug: "privado",
        name: "Privado 1 a 1",
        description: "4 clases privadas mensuales adaptadas a tu nivel.",
        pricePerMonth: 78000,
        featured: 0,
      },
    ],
  },
  {
    pro: {
      slug: "lucia-mendez",
      name: "Lucía Méndez",
      discipline: "pilates" as const,
      city: "Bariloche",
      bio: "Ex bailarina del Teatro Argentino. Instructora de Pilates Reformer y Mat hace 8 años. Especializada en recuperación postural y mujeres en pre/postparto. Estudio propio en el centro.",
      avatarUrl:
        "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&q=80",
    },
    plans: [
      {
        slug: "mat-2x",
        name: "Mat 2 veces por semana",
        description: "Pilates en colchoneta, grupo reducido (max 6).",
        pricePerMonth: 28000,
        featured: 0,
      },
      {
        slug: "reformer-3x",
        name: "Reformer 3 veces por semana",
        description: "Trabajo profundo en máquina con corrección personalizada.",
        pricePerMonth: 65000,
        featured: 1,
      },
    ],
  },
  {
    pro: {
      slug: "tomas-orellana",
      name: "Tomás Orellana",
      discipline: "yoga" as const,
      city: "Online",
      bio: "Profesor de Yin Yoga y meditación. Da clases online en vivo desde 2020. Comunidad de +400 alumnos en LATAM. Foco: lentitud, respiración consciente, sostener posturas.",
      avatarUrl:
        "https://images.unsplash.com/photo-1610552050890-fe99536c2615?w=400&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80",
    },
    plans: [
      {
        slug: "yin-mensual",
        name: "Yin mensual",
        description: "8 clases en vivo por mes vía Zoom + grabaciones.",
        pricePerMonth: 22000,
        featured: 1,
      },
      {
        slug: "comunidad",
        name: "Comunidad anual",
        description: "Todas las clases + retiro presencial 1 vez al año.",
        pricePerMonth: 48000,
        featured: 0,
      },
    ],
  },
];

async function main() {
  console.log("Seeding pros + plans...");

  for (const entry of seedData) {
    const [insertedPro] = await db
      .insert(schema.pros)
      .values(entry.pro)
      .onConflictDoNothing({ target: schema.pros.slug })
      .returning();

    const pro =
      insertedPro ??
      (await db.query.pros.findFirst({
        where: (p, { eq }) => eq(p.slug, entry.pro.slug),
      }));

    if (!pro) {
      throw new Error(`Failed to insert/find pro ${entry.pro.slug}`);
    }

    for (const planData of entry.plans) {
      await db
        .insert(schema.plans)
        .values({ ...planData, proId: pro.id })
        .onConflictDoNothing();
    }

    console.log(`  ✓ ${entry.pro.name} (${entry.plans.length} planes)`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
