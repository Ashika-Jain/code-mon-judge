const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'code-judge-backend',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

const sendSubmission = async (submission) => {
  await producer.connect();
  await producer.send({
    topic: 'submissions',
    messages: [{ value: JSON.stringify(submission) }],
  });
  await producer.disconnect();
};

module.exports = { sendSubmission };