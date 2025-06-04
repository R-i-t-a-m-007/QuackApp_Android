import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator,Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native"; // To refetch data when screen is focused
import { format } from "date-fns"; // For date formatting

export default function MyShiftsScreen() {
  const router = useRouter();
  const [shifts, setShifts] = useState([]);
  const [jobs, setJobs] = useState([]); // State to store the fetched jobs
  const [loading, setLoading] = useState(true); // Loader state
  const [workerId, setWorkerId] = useState(null);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await fetch("https://api.thequackapp.com/api/workers/me"); // Adjust API if needed
        if (response.ok) {
          const data = await response.json();
          setWorkerId(data._id); // Save worker ID
          
        }
      } catch (error) {
        console.error("Error fetching worker data:", error);
      }
    };
    fetchWorker();
  }, []);

  // Fetch shift and job data from the APIs
  const fetchShiftsAndJobs = async () => {
    try {
      // Fetch shifts for the worker
      const shiftsResponse = await fetch("https://api.thequackapp.com/api/workers/my-shifts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (shiftsResponse.ok) {
        const shiftsData = await shiftsResponse.json();
        setShifts(shiftsData);
      } else {
        console.error("Failed to fetch shifts", shiftsResponse.status);
      }

      // Fetch jobs where the worker is involved
      const jobsResponse = await fetch("https://api.thequackapp.com/api/jobs/mine", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
      } else {
        console.error("Failed to fetch jobs", jobsResponse.status);
      }

      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  // Refetch shifts and jobs whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setShifts([]); // Clear previous shifts and jobs
      setJobs([]);
      setLoading(true); // Show loader when refetching
      fetchShiftsAndJobs();
    }, [])
  );

  // Function to format date into day and month
  const formatDate = (date) => {
    const parsedDate = new Date(date);
    const day = format(parsedDate, "dd"); // Day of the month
    const month = format(parsedDate, "MMM"); // Month abbreviation
    return { day, month };
  };

  // Function to render shift details
  const renderShiftItem = ({ item }) => {
    const { day, month } = formatDate(item.date);
    const shiftTime = item.shift === "AM" ? "AM" : "PM";
  
    // Find the corresponding job for the shift
    const job = jobs.find((job) => new Date(job.date).toLocaleDateString() === new Date(item.date).toLocaleDateString());
  
    // Function to handle shift deletion
    const handleDeleteShift = async () => {
      if (!workerId) {
        Alert.alert("Error", "Worker ID not found. Please log in again.");
        return;
      }
  
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to remove your availability?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes",
            onPress: async () => {
              try {
                const response = await fetch("https://api.thequackapp.com/api/workers/cancel-shift", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    workerId: workerId, // ✅ Use the actual worker ID from state
                    date: item.date,
                    shift: item.shift,
                  }),
                });
  
                if (response.ok) {
                  Alert.alert("Success", "Your availability has been removed.");
                  fetchShiftsAndJobs(); // Refresh shifts after deletion
                } else {
                  Alert.alert("Error", "Failed to remove availability.");
                }
              } catch (error) {
                console.error("Error deleting shift:", error);
                Alert.alert("Error", "Something went wrong.");
              }
            },
          },
        ]
      );
    };
  
    return (
      <View style={styles.shiftCard}>
        {/* Date Section */}
        <View style={styles.dateContainer}>
          <Text style={styles.shiftDate}>{day}</Text>
          <Text style={styles.shiftMonth}>{month}</Text>
        </View>
  
        {/* Job Details (Name & Shift aligned left) */}
        <View style={styles.detailsContainer}>
          {job ? <Text style={styles.jobText}>Job: {job.title}</Text> : <Text style={styles.noJobText}>No job</Text>}
          <Text style={styles.shiftText}>SHIFT: {shiftTime}</Text>
        </View>
  
        {/* Delete Icon (Aligned Right) */}
        <TouchableOpacity style={styles.deleteIcon} onPress={handleDeleteShift}>
          <Ionicons name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };
  
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push('/workerdash')}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Shifts</Text>
        <Ionicons name="calendar" size={24} color="white" />
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#f3830a" />
        </View>
      ) : (
        <View style={styles.container}>
          {/* List of Shifts */}
          <FlatList
            data={shifts}
            keyExtractor={(item) => item._id}
            renderItem={renderShiftItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      )}

      {/* No shifts message */}
      {shifts.length === 0 && !loading && (
  <View style={styles.noShiftsContainer}>
    <Text style={styles.noShiftsText}>You have no shifts.</Text>
  </View>
)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3ae0a", // SafeArea background color
  },
  container: {
    flex: 1,
    backgroundColor: "#edeff2", // Light gray background for the screen
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#f3ae0a",
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  shiftCard: {
    flexDirection: "row",
    alignItems: "center", // Ensure vertical alignment
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5, // Shadow effect for the card
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 6.27,
    backgroundColor: "#f3ae0a", // Background color for the rest of the card
    // padding: 10, // Added padding
  },
  dateContainer: {
    backgroundColor: "white", // White background for the date part
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    width: 120, // Fixed width for date section
    borderRadius: 0,
  },
  shiftDate: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
  },
  shiftMonth: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start", // Align left
    paddingLeft: 10, // Add left padding for spacing
  },
  jobText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  noJobText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    fontStyle: "italic",
  },
  shiftTimeContainer: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 10,
  },
  shiftText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginTop: 5, 
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#edeff2", // Light gray background during loading
  },
  noShiftsContainer: {
    position: "absolute",
    top: "50%", 
    left: "55%",
    transform: [{ translateX: -100 }, { translateY: -10 }], // Adjust for centering
    width: 'auto', // Prevents overflow issues
    alignItems: "center",
    justifyContent: "center",
  },
  
  
  noShiftsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f3ae0a", // White text
  },
  
  deleteIcon: {
    padding: 10, // Add padding for better touch area
    alignItems: "center",
    justifyContent: "center",
  },
});
