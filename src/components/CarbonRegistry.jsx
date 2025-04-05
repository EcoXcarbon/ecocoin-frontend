// Rebuilding CarbonRegistry with full traceability and all admin tabs working
import React, { useEffect, useState } from "react";
import {
  Text,
  Table,
  Group,
  Loader,
  TextInput,
  Button,
  Divider,
  ScrollArea,
  Tabs,
  Code
} from "@mantine/core";
import {
  collection,
  getDocs,
  getFirestore,
  updateDoc,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
  query,
  where
} from "firebase/firestore";

const CarbonRegistry = () => {
  const [mergedData, setMergedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetId, setTargetId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [traceLog, setTraceLog] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subsSnap = await getDocs(collection(db, "assetSubmissions"));
        const balancesSnap = await getDocs(collection(db, "userBalances"));

        const submissions = subsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const balances = {};
        balancesSnap.forEach(doc => {
          balances[doc.id] = doc.data().ecoBalance || 0;
        });

        const userCO2 = {};
        const recordLinks = {};
        const rewardLinks = {};

        submissions.forEach(sub => {
          const uid = sub.userId || "unknown";
          const co2 = parseFloat(sub.co2Estimate || 0) / 1000;
          const reward = parseFloat(sub.ecoReward || 0);

          userCO2[uid] = (userCO2[uid] || 0) + co2;
          if (!recordLinks[uid]) recordLinks[uid] = [];
          if (!rewardLinks[uid]) rewardLinks[uid] = 0;

          recordLinks[uid].push(sub.id);
          rewardLinks[uid] += reward;
        });

        const allUsers = new Set([...Object.keys(balances), ...Object.keys(userCO2)]);

        const finalData = Array.from(allUsers).map(uid => ({
          userId: uid,
          ecoBalance: balances[uid] || 0,
          ecoFromSubmissions: rewardLinks[uid] || 0,
          co2Tons: userCO2[uid] || 0,
          recordIds: recordLinks[uid] || [],
        }));

        setMergedData(finalData);
      } catch (err) {
        console.error("Error loading registry:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const logTrace = (message) => {
    setTraceLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleTransfer = async () => {
    if (!targetId || isNaN(parseFloat(transferAmount))) return;
    try {
      const ref = doc(db, "userBalances", targetId);
      await setDoc(ref, { ecoBalance: parseFloat(transferAmount) }, { merge: true });
      logTrace(`Set ECO balance of ${transferAmount} to user ${targetId}`);
      alert("Balance updated.");
      window.location.reload();
    } catch (err) {
      console.error("Transfer failed:", err);
    }
  };

  const handleReset = async () => {
    if (!targetId) return;
    try {
      const subRef = doc(db, "assetSubmissions", targetId);
      const subSnap = await getDoc(subRef);
      if (!subSnap.exists()) return;

      const data = subSnap.data();
      const userId = data.userId || "unknown";

      await deleteDoc(subRef);
      await setDoc(doc(db, "resetSubmissions", targetId), {
        ...data,
        status: "reset",
        resetAt: new Date().toISOString()
      });

      if (userId !== "unknown") {
        await setDoc(doc(db, "userSubmissions", userId, "pending", targetId), {
          ...data,
          status: "returned",
          returnedAt: new Date().toISOString()
        });
      }

      logTrace(`Reset & returned record ${targetId} to user ${userId}`);
      alert("Submission reset, archived, and returned to user.");
      window.location.reload();
    } catch (err) {
      console.error("Reset logic failed:", err);
    }
  };

  const handleConvert = async () => {
    if (!targetId) return;
    try {
      const subRef = doc(db, "assetSubmissions", targetId);
      const subSnap = await getDoc(subRef);
      if (!subSnap.exists()) return;

      const data = subSnap.data();
      const userId = data.userId;
      const tons = parseFloat(data.co2Estimate || 0) / 1000;
      const reward = Math.floor(tons * 4);

      await updateDoc(subRef, {
        ecoReward: reward,
        converted: true
      });

      const userRef = doc(db, "userBalances", userId);
      const userSnap = await getDoc(userRef);
      const previous = userSnap.exists() ? userSnap.data().ecoBalance || 0 : 0;

      await setDoc(userRef, { ecoBalance: previous + reward }, { merge: true });

      logTrace(`Converted record ${targetId}: ${tons.toFixed(2)} tons → ${reward} ECO → user ${userId}`);
      alert(`Converted ${tons.toFixed(2)} tons CO₂ → ${reward} ECO`);
      window.location.reload();
    } catch (err) {
      console.error("Convert failed:", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <Text size="xl" weight={600} mb="md">Carbon Registry Dashboard</Text>

      {loading ? (
        <Group position="center" mt="lg">
          <Loader />
          <Text ml="sm">Loading data...</Text>
        </Group>
      ) : (
        <ScrollArea>
          <Table striped highlightOnHover mt="md">
            <thead>
              <tr>
                <th>User ID</th>
                <th>ECO Balance</th>
                <th>ECO from Submissions</th>
                <th>Total CO₂ Sequestered (tons)</th>
                <th>Record IDs</th>
              </tr>
            </thead>
            <tbody>
              {mergedData.map((entry) => (
                <tr key={entry.userId}>
                  <td>{entry.userId !== "unknown" ? entry.userId : <i>Unknown</i>}</td>
                  <td>{entry.ecoBalance}</td>
                  <td>{entry.ecoFromSubmissions}</td>
                  <td>{entry.co2Tons.toFixed(3)}</td>
                  <td style={{ fontSize: "0.8rem" }}>{entry.recordIds.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      )}

      <Divider my="xl" />
      <Text size="lg" weight={500} mb="sm">Admin Actions (Triggered by Record/User ID)</Text>

      <TextInput
        label="Record or User ID"
        placeholder="Paste ID here"
        value={targetId}
        onChange={(e) => setTargetId(e.currentTarget.value)}
        mb="md"
      />

      <Tabs defaultValue="transfer">
        <Tabs.List>
          <Tabs.Tab value="transfer">Transfer Balance</Tabs.Tab>
          <Tabs.Tab value="convert">Convert Record</Tabs.Tab>
          <Tabs.Tab value="reset">Reset Record</Tabs.Tab>
          <Tabs.Tab value="trace">Trace Log</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="transfer" pt="md">
          <Group>
            <TextInput
              placeholder="ECO to Set"
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.currentTarget.value)}
            />
            <Button onClick={handleTransfer}>Set Balance</Button>
          </Group>
        </Tabs.Panel>

        <Tabs.Panel value="convert" pt="md">
          <Button color="green" onClick={handleConvert}>Convert to ECO</Button>
        </Tabs.Panel>

        <Tabs.Panel value="reset" pt="md">
          <Button color="red" onClick={handleReset}>Reset & Return to User</Button>
        </Tabs.Panel>

        <Tabs.Panel value="trace" pt="md">
          <ScrollArea h={200} p="xs" style={{ background: "#f8f8f8", border: "1px solid #ccc" }}>
            {traceLog.length === 0 ? (
              <Text color="dimmed">No activity logged yet.</Text>
            ) : (
              traceLog.map((log, idx) => <Code key={idx} block>{log}</Code>)
            )}
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default CarbonRegistry;
