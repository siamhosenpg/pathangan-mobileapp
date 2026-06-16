import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function SheetScreen() {
  const topics = [
    "Present Indefinite Tense",
    "Present Continuous Tense",
    "Present Perfect Tense",
    "Past Indefinite Tense",
    "Future Indefinite Tense",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={28} color="#4F46E5" />
            <Text style={styles.cardTitle}>Tense Sheet</Text>
          </View>

          <Text style={styles.description}>
            This sheet contains important tense topics with examples and
            exercises for practice.
          </Text>

          {topics.map((topic, index) => (
            <View key={index} style={styles.topicItem}>
              <View style={styles.topicDot} />
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Quick Note</Text>
          <Text style={styles.infoText}>
            Practice each tense daily and make your own examples to improve
            faster.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFF",
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
  },
  card: {
    backgroundColor: "#FFF",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  description: {
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 20,
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  topicDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4F46E5",
    marginRight: 12,
  },
  topicText: {
    fontSize: 16,
    color: "#1E293B",
  },
  infoCard: {
    backgroundColor: "#EEF2FF",
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4338CA",
    marginBottom: 8,
  },
  infoText: {
    color: "#475569",
    lineHeight: 22,
  },
});
