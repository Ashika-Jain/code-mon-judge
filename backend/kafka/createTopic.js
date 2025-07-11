const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'topic-creator',
  brokers: ['localhost:9092'],
});

const admin = kafka.admin();

async function createTopic() {
  await admin.connect();
  await admin.createTopics({
    topics: [{ topic: 'submissions', numPartitions: 1, replicationFactor: 1 }],
  });
  await admin.disconnect();
  console.log('Topic created!');
}

createTopic().catch(console.error);