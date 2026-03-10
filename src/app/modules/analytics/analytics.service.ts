import { prisma } from "src/helpers.ts/prisma.js";
import { convertToCSV } from "../../shared/utils/csv.js";

const getUserAnalytics = async (userId: string) => {
  const totalJobs = await prisma.job.count({ where: { userId } });
  
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      offer: true,
    }
  });

  const totalBookings = bookings.length;
  
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const totalCompletedBookings = completedBookings.length;
  
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.offer?.price || 0), 0);
  
  const reviewsGiven = await prisma.review.count({ where: { userId } });

  return {
    totalJobs,
    totalBookings,
    totalCompletedBookings,
    totalSpent,
    reviewsGiven,
  };
};

const getWorkshopAnalytics = async (workshopId: string) => {
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    select: { avgRating: true, reviewsCount: true }
  });

  const totalOffersMade = await prisma.jobOffer.count({ where: { workshopId } });
  
  const bookings = await prisma.booking.findMany({
    where: { workshopId },
    include: {
      offer: true,
    }
  });

  const totalBookings = bookings.length;
  
  const activeBookings = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "IN_PROGRESS").length;
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
  
  const totalRevenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + (b.offer?.price || 0), 0);

  return {
    totalOffersMade,
    totalBookings,
    activeBookings,
    completedBookings,
    totalRevenue,
    avgRating: workshop?.avgRating || 0,
    reviewsCount: workshop?.reviewsCount || 0,
  };
};

const getAdminAnalytics = async () => {
  const totalUsers = await prisma.user.count({ where: { role: "USER" } });
  const totalWorkshops = await prisma.workshop.count();
  
  const totalJobs = await prisma.job.count();
  const totalBookings = await prisma.booking.count();
  
  const completedBookings = await prisma.booking.findMany({
    where: { status: "COMPLETED" },
    include: { offer: true }
  });
  const totalPlatformRevenue = completedBookings.reduce((sum, b) => sum + (b.offer?.price || 0), 0);

  // Status Breakdowns
  const workshopsByStatusRaw = await prisma.workshop.groupBy({
    by: ['approvalStatus'],
    _count: { approvalStatus: true }
  });
  const workshopsByStatus = workshopsByStatusRaw.reduce((acc, curr) => {
    acc[curr.approvalStatus] = curr._count.approvalStatus;
    return acc;
  }, {} as Record<string, number>);

  const jobsByStatusRaw = await prisma.job.groupBy({
    by: ['status'],
    _count: { status: true }
  });
  const jobsByStatus = jobsByStatusRaw.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, {} as Record<string, number>);

  const bookingsByStatusRaw = await prisma.booking.groupBy({
    by: ['status'],
    _count: { status: true }
  });
  const bookingsByStatus = bookingsByStatusRaw.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, {} as Record<string, number>);

  return {
    overview: {
      totalUsers,
      totalWorkshops,
      totalJobs,
      totalBookings,
      totalPlatformRevenue,
    },
    statusBreakdowns: {
      workshops: workshopsByStatus,
      jobs: jobsByStatus,
      bookings: bookingsByStatus,
    }
  };
};

const getMonthlyReport = async (year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const prevStartDate = new Date(year, month - 2, 1);
  const prevEndDate = new Date(year, month - 1, 0, 23, 59, 59, 999);

  const getMetrics = async (start: Date, end: Date) => {
    const newUserCount = await prisma.user.count({ 
      where: { role: "USER", createdAt: { gte: start, lte: end } } 
    });
    const newWorkshopCount = await prisma.workshop.count({ 
      where: { createdAt: { gte: start, lte: end } } 
    });
    const bookingCount = await prisma.booking.count({ 
      where: { createdAt: { gte: start, lte: end } } 
    });
    
    const completedBookings = await prisma.booking.findMany({
      where: { 
        status: "COMPLETED", 
        createdAt: { gte: start, lte: end } 
      },
      include: { offer: true }
    });
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.offer?.price || 0), 0);

    return { newUserCount, newWorkshopCount, bookingCount, totalRevenue };
  };

  const currentMetrics = await getMetrics(startDate, endDate);
  const prevMetrics = await getMetrics(prevStartDate, prevEndDate);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat(((current - previous) / previous * 100).toFixed(2));
  };

  const summary = {
    users: { total: currentMetrics.newUserCount, growth: calculateGrowth(currentMetrics.newUserCount, prevMetrics.newUserCount) },
    workshops: { total: currentMetrics.newWorkshopCount, growth: calculateGrowth(currentMetrics.newWorkshopCount, prevMetrics.newWorkshopCount) },
    bookings: { total: currentMetrics.bookingCount, growth: calculateGrowth(currentMetrics.bookingCount, prevMetrics.bookingCount) },
    revenue: { total: currentMetrics.totalRevenue, growth: calculateGrowth(currentMetrics.totalRevenue, prevMetrics.totalRevenue) },
  };

  // Daily Data
  const dailyData = [];
  const daysInMonth = endDate.getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const dayStart = new Date(year, month - 1, i, 0, 0, 0, 0);
    const dayEnd = new Date(year, month - 1, i, 23, 59, 59, 999);
    
    const dayBookings = await prisma.booking.count({
      where: { createdAt: { gte: dayStart, lte: dayEnd } }
    });
    
    const dayRevenueRaw = await prisma.booking.findMany({
      where: { 
        status: "COMPLETED", 
        createdAt: { gte: dayStart, lte: dayEnd } 
      },
      include: { offer: true }
    });
    const dayRevenue = dayRevenueRaw.reduce((sum, b) => sum + (b.offer?.price || 0), 0);

    dailyData.push({
      day: i,
      bookings: dayBookings,
      revenue: dayRevenue
    });
  }

  // Top Workshops
  const topWorkshopsRaw = await prisma.booking.groupBy({
    by: ['workshopId'],
    where: { 
      status: "COMPLETED",
      createdAt: { gte: startDate, lte: endDate }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  });

  const topWorkshops = await Promise.all(topWorkshopsRaw.map(async (item) => {
    const workshop = await prisma.workshop.findUnique({
      where: { id: item.workshopId },
      select: { id: true, workshopName: true, avatar: true }
    });
    
    const revenueSum = await prisma.booking.findMany({
      where: {
        workshopId: item.workshopId,
        status: "COMPLETED",
        createdAt: { gte: startDate, lte: endDate }
      },
      include: { offer: true }
    });
    
    const totalRevenue = revenueSum.reduce((sum, b) => sum + (b.offer?.price || 0), 0);
    
    return {
      ...workshop,
      bookingCount: item._count.id,
      totalRevenue
    };
  }));

  return {
    month,
    year,
    summary,
    dailyData,
    topWorkshops
  };
};

const exportUsersCSV = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      city: true,
      isVerified: true,
      createdAt: true
    }
  });
  return convertToCSV(users);
};

const exportWorkshopsCSV = async () => {
  const workshops = await prisma.workshop.findMany({
    select: {
      id: true,
      workshopName: true,
      email: true,
      phone: true,
      ownerName: true,
      cvrNumber: true,
      city: true,
      approvalStatus: true,
      avgRating: true,
      isVerified: true,
      createdAt: true
    }
  });
  return convertToCSV(workshops);
};

const exportJobsCSV = async () => {
  const jobs = await prisma.job.findMany({
    select: {
      id: true,
      title: true,
      bikeName: true,
      bikeType: true,
      city: true,
      urgency: true,
      status: true,
      createdAt: true
    }
  });
  return convertToCSV(jobs);
};

const exportBookingsCSV = async () => {
  const bookings = await prisma.booking.findMany({
    select: {
      id: true,
      userId: true,
      workshopId: true,
      status: true,
      paymentStatus: true,
      scheduleStart: true,
      scheduleEnd: true,
      createdAt: true
    }
  });
  return convertToCSV(bookings);
};

export const AnalyticsService = {
  getUserAnalytics,
  getWorkshopAnalytics,
  getAdminAnalytics,
  getMonthlyReport,
  exportUsersCSV,
  exportWorkshopsCSV,
  exportJobsCSV,
  exportBookingsCSV,
};
