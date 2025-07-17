# Kafka Architecture Diagram - Code Judge System

## System Architecture Overview

```mermaid
graph TB
    %% Frontend Components
    subgraph "Frontend (React)"
        UI[User Interface]
        CodeEditor[Code Editor]
        SubmitBtn[Submit Button]
    end

    %% Main Server (API/Backend)
    subgraph "Main Server (API/Backend)"
        API[API Server]
        Auth[Authentication]
        SubmissionCtrl[Submission Controller]
        Producer[Kafka Producer]
    end

    %% Compiler Server (Kafka Consumer/Worker)
    subgraph "Compiler Server (Kafka Consumer/Worker)"
        Consumer[Kafka Consumer]
        Worker[Code Execution Worker]
    end

    %% Database
    subgraph "Database (MongoDB)"
        Users[(Users Collection)]
        Problems[(Problems Collection)]
        Submissions[(Submissions Collection)]
    end

    %% Kafka Components
    subgraph "Kafka Infrastructure"
        Zookeeper[Zookeeper]
        Kafka[Kafka Broker]
        Topic[submissions Topic]
    end

    %% File System
    subgraph "File System (Compiler Server)"
        TempFiles[Temp Files]
        Uploads[Uploads Directory]
    end

    %% Connections
    UI --> API
    CodeEditor --> API
    SubmitBtn --> API
    
    API --> Auth
    API --> SubmissionCtrl
    
    Auth --> Users
    SubmissionCtrl --> Problems
    SubmissionCtrl --> Submissions
    
    SubmissionCtrl --> Producer
    Producer --> Topic
    Topic --> Consumer
    Consumer --> Worker
    
    Worker --> TempFiles
    Worker --> Uploads
    Worker --> Submissions

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef mainserver fill:#f3e5f5
    classDef compilerserver fill:#ffe0b2
    classDef database fill:#e8f5e8
    classDef kafka fill:#fff3e0
    classDef files fill:#fce4ec

    class UI,CodeEditor,SubmitBtn frontend
    class API,Auth,SubmissionCtrl,Producer mainserver
    class Consumer,Worker compilerserver
    class Users,Problems,Submissions database
    class Zookeeper,Kafka,Topic kafka
    class TempFiles,Uploads files
```

## Detailed Data Flow Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant MS as Main Server (API)
    participant DB as MongoDB
    participant KP as Kafka Producer (Main Server)
    participant K as Kafka Topic
    participant CS as Compiler Server (Consumer)
    participant FS as File System (Compiler Server)

    Note over U,FS: Submission Flow (USE_KAFKA=true)

    U->>F: Write code & click submit
    F->>MS: POST /api/submissions/submit
    MS->>MS: Authenticate user (JWT)
    MS->>DB: Save submission (status: 'pending')
    MS->>KP: sendSubmission(submissionData)
    KP->>K: Send message to 'submissions' topic
    MS->>F: Return 202 Accepted + submissionId
    F->>U: Show "Submission queued" message

    Note over U,FS: Asynchronous Processing

    CS->>K: Consume message from topic
    CS->>DB: Fetch problem details
    CS->>FS: Create temp file with code
    CS->>FS: Compile code (if needed)
    
    loop For each test case
        CS->>FS: Execute code with test input
        CS->>CS: Compare output with expected
    end
    
    CS->>FS: Clean up temp files
    CS->>DB: Update submission status & results

    Note over U,FS: Result Polling

    F->>MS: GET /api/submissions/{id} (polling)
    MS->>DB: Fetch updated submission
    MS->>F: Return current status
    F->>U: Update UI with verdict
```

## Synchronous vs Asynchronous Mode

```mermaid
flowchart TD
    Start([User Submits Code]) --> CheckMode{Mode?}
    
    CheckMode -->|"run"| RunMode[Execute & Return Output (Main Server)]
    CheckMode -->|"submit"| CheckKafka{USE_KAFKA?}
    
    CheckKafka -->|"true"| AsyncMode[Asynchronous Mode (Compiler Server)]
    CheckKafka -->|"false"| SyncMode[Synchronous Mode (Main Server)]
    
    AsyncMode --> SaveDB[Save to DB (pending) (Main Server)]
    AsyncMode --> SendKafka[Send to Kafka Topic (Main Server)]
    AsyncMode --> Return202[Return 202 Accepted (Main Server)]
    AsyncMode --> PollResults[Frontend Polls for Results]
    
    SyncMode --> ExecuteCode[Execute Code Immediately (Main Server)]
    SyncMode --> UpdateDB[Update DB with Results (Main Server)]
    SyncMode --> ReturnResults[Return Results Directly (Main Server)]
    
    RunMode --> ReturnOutput[Return Output to User]
    Return202 --> PollResults
    PollResults --> CheckStatus{Status Updated?}
    CheckStatus -->|"No"| PollResults
    CheckStatus -->|"Yes"| ShowResults[Show Results to User]
    
    ExecuteCode --> UpdateDB
    UpdateDB --> ReturnResults
    ReturnResults --> ShowResults
    ReturnOutput --> End([End])
    ShowResults --> End
```

## Kafka Topic Structure

```mermaid
graph LR
    subgraph "Kafka Topic: submissions"
        Partition[Partition 0]
    end
    
    subgraph "Message Format"
        Message[{"_id": "submission_id", "userId": "user_id", "problemId": "problem_id", "code": "source_code", "language": "cpp|java|python"}]
    end
    
    Producer -.-> Partition
    Partition -.-> Consumer
    Message -.-> Partition
```

## Database Schema Relationships

```mermaid
erDiagram
    USERS {
        ObjectId _id
        String email
        String password
        String name
        Array dailyProblemHistory
        Timestamp createdAt
        Timestamp updatedAt
    }
    
    PROBLEMS {
        ObjectId _id
        String title
        String description
        String difficulty
        Array testCases
        Number timeLimit
        Number memoryLimit
        Timestamp createdAt
        Timestamp updatedAt
    }
    
    SUBMISSIONS {
        ObjectId _id
        ObjectId problemId
        ObjectId userId
        String code
        String language
        String status
        Number testCasesPassed
        Number totalTestCases
        String errorMessage
        Timestamp createdAt
        Timestamp updatedAt
    }
    
    USERS ||--o{ SUBMISSIONS : "submits"
    PROBLEMS ||--o{ SUBMISSIONS : "has"
```

## Component Interaction Details

### Main Server (API/Backend)
- Handles API requests, authentication, and database operations
- Sends submissions to Kafka topic as producer
- Returns immediate response to frontend

### Compiler Server (Kafka Consumer/Worker)
- Consumes submissions from Kafka topic
- Executes and judges code, updates submission status in DB
- Handles all file system operations for code execution

### Database Operations
- **Write Operations**: Create submission, update status
- **Read Operations**: Fetch problem details, get submission status
- **Indexes**: Optimized for submission queries and user progress tracking

This architecture provides:
- **Scalability**: Handle multiple concurrent submissions
- **Reliability**: Fault-tolerant message processing
- **Performance**: Quick API responses with background processing
- **Flexibility**: Easy switching between sync/async modes 