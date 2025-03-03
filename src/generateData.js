import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { driver } from './config/db.js';

dotenv.config();

async function executeQuery(query, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result;
  } finally {
    await session.close();
  }
}

async function clearDatabase() {
  console.log('Clearing database...');
  const query = `
    MATCH (n)
    DETACH DELETE n
  `;
  await executeQuery(query);
  console.log('Database cleared');
}

function generateClientData(count) {
  const clients = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    clients.push({
      clientId: `C${i + 1000}`,
      name: `${firstName} ${lastName}`,
      identificationNumber: faker.string.numeric(9),
      email: faker.internet.email({ firstName, lastName }),
      phoneNumber: faker.phone.number(),
      riskScore: parseFloat(faker.number.float({ min: 0, max: 1, precision: 0.01 })),
      creationDate: faker.date.past({ years: 5 }).toISOString(),
      isActive: faker.datatype.boolean(0.9),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      postalCode: faker.location.zipCode(),
      occupation: faker.person.jobTitle(),
      annualIncome: parseFloat(faker.number.float({ min: 20000, max: 200000, precision: 0.01 })),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString(),
      gender: faker.person.sex(),
      lastLoginDate: faker.date.recent({ days: 30 }).toISOString(),
      fraudFlag: faker.datatype.boolean(0.05)
    });
  }

  return clients;
}

function generateAccountData(clients) {
  const accounts = [];

  clients.forEach(client => {
    const accountCount = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < accountCount; i++) {
      const accountTypes = ['Savings', 'Checking', 'Credit', 'Investment', 'Loan'];
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
      const statuses = ['Active', 'Dormant', 'Suspended', 'Closed'];

      const creationDate = new Date(client.creationDate);
      const daysSinceCreation = Math.floor((Date.now() - creationDate) / (1000 * 60 * 60 * 24));

      accounts.push({
        accountId: `A${client.clientId}${i}`,
        accountNumber: faker.finance.accountNumber(),
        clientId: client.clientId,
        balance: parseFloat(faker.finance.amount({ min: 100, max: 100000, dec: 2 })),
        creationDate: faker.date.between({
          from: creationDate,
          to: new Date()
        }).toISOString(),
        lastActivity: faker.date.recent({ days: 30 }).toISOString(),
        accountType: faker.helpers.arrayElement(accountTypes),
        currency: faker.helpers.arrayElement(currencies),
        status: faker.helpers.arrayElement(statuses),
        interestRate: parseFloat(faker.number.float({ min: 0.01, max: 5.0, precision: 0.01 })),
        overdraftLimit: parseFloat(faker.finance.amount({ min: 0, max: 5000, dec: 2 })),
        averageTransactionAmount: parseFloat(faker.finance.amount({ min: 50, max: 2000, dec: 2 })),
        creditScore: faker.number.int({ min: 300, max: 850 }),
        accountAgeInDays: daysSinceCreation,
        balanceChangePercent: parseFloat(faker.number.float({ min: -70, max: 100, precision: 0.1 }))
      });
    }
  });

  return accounts;
}

function generateDeviceData(count) {
  const devices = [];

  for (let i = 0; i < count; i++) {
    const deviceTypes = ['Mobile', 'Desktop', 'Tablet', 'IoT'];
    const operatingSystems = ['iOS', 'Android', 'Windows', 'macOS', 'Linux'];
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];

    devices.push({
      deviceId: `D${i + 1000}`,
      type: faker.helpers.arrayElement(deviceTypes),
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      operatingSystem: faker.helpers.arrayElement(operatingSystems),
      browser: faker.helpers.arrayElement(browsers),
      lastSeen: faker.date.recent({ days: 60 }).toISOString(),
      isTrusted: faker.datatype.boolean(0.85),
      deviceFingerprint: faker.string.alphanumeric(20),
      screenResolution: `${faker.number.int({ min: 1024, max: 3840 })}x${faker.number.int({ min: 768, max: 2160 })}`,
      cookiesEnabled: faker.datatype.boolean(0.95),
      language: faker.location.countryCode(),
      timezone: faker.location.timeZone(),
      riskScore: parseFloat(faker.number.float({ min: 0, max: 1, precision: 0.01 }))
    });
  }

  return devices;
}

function generateLocationData(count) {
  const locations = [];

  for (let i = 0; i < count; i++) {
    const riskLevels = ['Low', 'Medium', 'High'];

    locations.push({
      locationId: `L${i + 1000}`,
      country: faker.location.country(),
      city: faker.location.city(),
      latitude: parseFloat(faker.location.latitude()),
      longitude: parseFloat(faker.location.longitude()),
      riskLevel: faker.helpers.arrayElement(riskLevels),
      postalCode: faker.location.zipCode(),
      isKnownFraudHotspot: faker.datatype.boolean(0.1),
      timezone: faker.location.timeZone(),
      isp: faker.company.name(),
      areaCode: faker.string.numeric(3),
      regionName: faker.location.state(),
      reputationScore: parseFloat(faker.number.float({ min: 0, max: 1, precision: 0.01 }))
    });
  }

  return locations;
}

function generateTransactionData(accounts, devices, locations, count) {
  const transactions = [];

  for (let i = 0; i < count; i++) {
    const transactionTypes = ['Wire', 'Credit', 'Debit', 'Transfer', 'Payment', 'Withdrawal', 'Deposit'];
    const statuses = ['Completed', 'Pending', 'Failed', 'Cancelled'];
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

    const fromAccount = faker.helpers.arrayElement(accounts);
    let toAccount = faker.helpers.arrayElement(accounts);
    while (toAccount.accountId === fromAccount.accountId) {
      toAccount = faker.helpers.arrayElement(accounts);
    }

    const device = faker.helpers.arrayElement(devices);
    const location = faker.helpers.arrayElement(locations);

    const baseAmount = parseFloat(fromAccount.averageTransactionAmount);
    const amount = parseFloat(faker.finance.amount({
      min: baseAmount * 0.1,
      max: baseAmount * 5,
      dec: 2
    }));

    const date = faker.date.recent({ days: 365 }).toISOString();

    transactions.push({
      transactionId: `T${i + 10000}`,
      fromAccountId: fromAccount.accountId,
      toAccountId: toAccount.accountId,
      deviceId: device.deviceId,
      locationId: location.locationId,
      amount: amount,
      date: date,
      status: faker.helpers.arrayElement(statuses),
      type: faker.helpers.arrayElement(transactionTypes),
      description: faker.finance.transactionDescription(),
      currency: faker.helpers.arrayElement(currencies),
      riskScore: parseFloat(faker.number.float({ min: 0, max: 1, precision: 0.01 })),
      isInternational: faker.datatype.boolean(0.2),
      fee: parseFloat(faker.finance.amount({ min: 0, max: 50, dec: 2 })),
      exchangeRate: parseFloat(faker.number.float({ min: 0.5, max: 2, precision: 0.0001 })),
      category: faker.finance.transactionType(),
      referenceNumber: faker.string.alphanumeric(10)
    });
  }

  return transactions;
}

function generateFraudPatterns(accounts, devices, locations) {
  const fraudTransactions = [];
  const fraudPatterns = [];

  console.log('Generating circular transaction fraud patterns...');

  for (let i = 0; i < 3; i++) {
    const selectedAccounts = faker.helpers.shuffle([...accounts]).slice(0, 3);
    const a1 = selectedAccounts[0];
    const a2 = selectedAccounts[1];
    const a3 = selectedAccounts[2];

    const highRiskDevices = devices.filter(d => d.riskScore > 0.7);
    const highRiskLocations = locations.filter(l => l.riskLevel === 'High' || l.isKnownFraudHotspot);

    const device = highRiskDevices.length > 0
      ? faker.helpers.arrayElement(highRiskDevices)
      : faker.helpers.arrayElement(devices);

    const location = highRiskLocations.length > 0
      ? faker.helpers.arrayElement(highRiskLocations)
      : faker.helpers.arrayElement(locations);

    const baseDate = faker.date.recent({ days: 2 });

    const t1 = {
      transactionId: `FT${i}1`,
      fromAccountId: a1.accountId,
      toAccountId: a2.accountId,
      deviceId: device.deviceId,
      locationId: location.locationId,
      amount: parseFloat(faker.finance.amount({ min: 9000, max: 20000, dec: 2 })),
      date: new Date(baseDate.getTime()).toISOString(),
      status: 'Completed',
      type: 'Wire',
      description: 'Investment transfer',
      currency: 'USD',
      riskScore: parseFloat(faker.number.float({ min: 0.7, max: 0.9, precision: 0.01 })),
      isInternational: false,
      fee: parseFloat(faker.finance.amount({ min: 10, max: 50, dec: 2 })),
      category: 'Transfer',
      referenceNumber: `FRAUD-C${i}1`
    };

    const t2 = {
      transactionId: `FT${i}2`,
      fromAccountId: a2.accountId,
      toAccountId: a3.accountId,
      deviceId: device.deviceId,
      locationId: location.locationId,
      amount: t1.amount * (1 - faker.number.float({ min: 0.02, max: 0.1 })),
      date: new Date(baseDate.getTime() + 1000 * 60 * 60 * 2).toISOString(),
      status: 'Completed',
      type: 'Wire',
      description: 'Consulting fees',
      currency: 'USD',
      riskScore: parseFloat(faker.number.float({ min: 0.7, max: 0.9, precision: 0.01 })),
      isInternational: false,
      fee: parseFloat(faker.finance.amount({ min: 10, max: 50, dec: 2 })),
      category: 'Transfer',
      referenceNumber: `FRAUD-C${i}2`
    };

    const t3 = {
      transactionId: `FT${i}3`,
      fromAccountId: a3.accountId,
      toAccountId: a1.accountId,
      deviceId: device.deviceId,
      locationId: location.locationId,
      amount: t2.amount * (1 - faker.number.float({ min: 0.02, max: 0.1 })),
      date: new Date(baseDate.getTime() + 1000 * 60 * 60 * 5).toISOString(),
      status: 'Completed',
      type: 'Wire',
      description: 'Return on investment',
      currency: 'USD',
      riskScore: parseFloat(faker.number.float({ min: 0.75, max: 0.95, precision: 0.01 })),
      isInternational: false,
      fee: parseFloat(faker.finance.amount({ min: 10, max: 50, dec: 2 })),
      category: 'Transfer',
      referenceNumber: `FRAUD-C${i}3`
    };

    fraudTransactions.push(t1, t2, t3);

    fraudPatterns.push({
      type: 'CircularTransaction',
      accounts: [a1.accountId, a2.accountId, a3.accountId],
      transactions: [t1.transactionId, t2.transactionId, t3.transactionId],
      device: device.deviceId,
      location: location.locationId,
      totalAmount: t1.amount + t2.amount + t3.amount,
      timeSpan: '5 hours'
    });
  }

  console.log('Generating rapid successive transaction fraud patterns...');

  for (let i = 0; i < 3; i++) {
    const fromAccount = faker.helpers.arrayElement(accounts);

    const highRiskDevices = devices.filter(d => d.riskScore > 0.7);
    const device = highRiskDevices.length > 0
      ? faker.helpers.arrayElement(highRiskDevices)
      : faker.helpers.arrayElement(devices);

    const location = faker.helpers.arrayElement(locations);

    const baseDate = faker.date.recent({ days: 2 });

    const transactionCount = faker.number.int({ min: 3, max: 6 });
    const rapidTransactions = [];

    for (let j = 0; j < transactionCount; j++) {
      let toAccount = faker.helpers.arrayElement(accounts);
      while (toAccount.accountId === fromAccount.accountId) {
        toAccount = faker.helpers.arrayElement(accounts);
      }

      const transactionDate = new Date(baseDate.getTime() + 1000 * 60 * j * 3);

      const transaction = {
        transactionId: `FT${i}R${j}`,
        fromAccountId: fromAccount.accountId,
        toAccountId: toAccount.accountId,
        deviceId: device.deviceId,
        locationId: location.locationId,
        amount: parseFloat(faker.finance.amount({ min: 100, max: 500, dec: 2 })),
        date: transactionDate.toISOString(),
        status: 'Completed',
        type: 'Transfer',
        description: faker.finance.transactionDescription(),
        currency: 'USD',
        riskScore: parseFloat(faker.number.float({ min: 0.6, max: 0.9, precision: 0.01 })),
        isInternational: false,
        fee: parseFloat(faker.finance.amount({ min: 1, max: 5, dec: 2 })),
        category: 'Transfer',
        referenceNumber: `FRAUD-R${i}${j}`
      };

      rapidTransactions.push(transaction);
      fraudTransactions.push(transaction);
    }

    fraudPatterns.push({
      type: 'RapidSuccessiveTransactions',
      account: fromAccount.accountId,
      transactions: rapidTransactions.map(t => t.transactionId),
      device: device.deviceId,
      location: location.locationId,
      transactionCount: transactionCount,
      timeSpan: `${transactionCount * 3} minutes`
    });
  }

  console.log('Generating multi-location fraud patterns...');

  for (let i = 0; i < 3; i++) {
    const account = faker.helpers.arrayElement(accounts);

    const selectedLocations = faker.helpers.shuffle([...locations]).slice(0, 3);

    const baseDate = faker.date.recent({ days: 2 });

    const multiLocationTransactions = [];

    for (let j = 0; j < 3; j++) {
      let toAccount = faker.helpers.arrayElement(accounts);
      while (toAccount.accountId === account.accountId) {
        toAccount = faker.helpers.arrayElement(accounts);
      }

      const transactionDate = new Date(baseDate.getTime() + 1000 * 60 * 60 * j * 2);

      const transaction = {
        transactionId: `FT${i}L${j}`,
        fromAccountId: account.accountId,
        toAccountId: toAccount.accountId,
        deviceId: faker.helpers.arrayElement(devices).deviceId,
        locationId: selectedLocations[j].locationId,
        amount: parseFloat(faker.finance.amount({ min: 500, max: 3000, dec: 2 })),
        date: transactionDate.toISOString(),
        status: 'Completed',
        type: faker.helpers.arrayElement(['Withdrawal', 'Transfer', 'Payment']),
        description: faker.finance.transactionDescription(),
        currency: 'USD',
        riskScore: parseFloat(faker.number.float({ min: 0.7, max: 0.95, precision: 0.01 })),
        isInternational: faker.datatype.boolean(0.3),
        fee: parseFloat(faker.finance.amount({ min: 5, max: 25, dec: 2 })),
        category: 'Suspicious',
        referenceNumber: `FRAUD-L${i}${j}`
      };

      multiLocationTransactions.push(transaction);
      fraudTransactions.push(transaction);
    }

    fraudPatterns.push({
      type: 'MultiLocationAccess',
      account: account.accountId,
      transactions: multiLocationTransactions.map(t => t.transactionId),
      locations: selectedLocations.map(l => l.locationId),
      timeSpan: '4 hours'
    });
  }

  return { fraudTransactions, fraudPatterns };
}

async function loadClientsInBatches(clients) {
  const batchSize = 50;
  console.log(`Loading ${clients.length} clients in batches of ${batchSize}...`);

  for (let i = 0; i < clients.length; i += batchSize) {
    const batch = clients.slice(i, i + batchSize);
    console.log(`Processing client batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(clients.length / batchSize)}...`);

    await executeQuery(`
      UNWIND $clients AS client
      CREATE (c:Client {
        clientId: client.clientId,
        name: client.name,
        identificationNumber: client.identificationNumber,
        email: client.email,
        phoneNumber: client.phoneNumber,
        riskScore: client.riskScore,
        creationDate: datetime(client.creationDate),
        isActive: client.isActive,
        address: client.address,
        city: client.city,
        country: client.country,
        postalCode: client.postalCode,
        occupation: client.occupation,
        annualIncome: client.annualIncome,
        dateOfBirth: datetime(client.dateOfBirth),
        gender: client.gender,
        lastLoginDate: datetime(client.lastLoginDate),
        fraudFlag: client.fraudFlag
      })
    `, { clients: batch });
  }
}

async function loadAccountsInBatches(accounts) {
  const batchSize = 50;
  console.log(`Loading ${accounts.length} accounts in batches of ${batchSize}...`);

  for (let i = 0; i < accounts.length; i += batchSize) {
    const batch = accounts.slice(i, i + batchSize);
    console.log(`Processing account batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(accounts.length / batchSize)}...`);

    await executeQuery(`
      UNWIND $accounts AS account
      CREATE (a:Account {
        accountId: account.accountId,
        accountNumber: account.accountNumber,
        balance: account.balance,
        creationDate: datetime(account.creationDate),
        lastActivity: datetime(account.lastActivity),
        accountType: account.accountType,
        currency: account.currency,
        status: account.status,
        interestRate: account.interestRate,
        overdraftLimit: account.overdraftLimit,
        averageTransactionAmount: account.averageTransactionAmount,
        creditScore: account.creditScore,
        accountAgeInDays: account.accountAgeInDays,
        balanceChangePercent: account.balanceChangePercent
      })
    `, { accounts: batch });
  }

  console.log("Creating OWNS relationships...");
  for (let i = 0; i < accounts.length; i += batchSize) {
    const batch = accounts.slice(i, i + batchSize);
    console.log(`Processing OWNS relationships batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(accounts.length / batchSize)}...`);

    await executeQuery(`
      UNWIND $accounts AS account
      MATCH (c:Client {clientId: account.clientId})
      MATCH (a:Account {accountId: account.accountId})
      CREATE (c)-[r:OWNS {
        since: datetime(account.creationDate),
        isPrimary: true,
        accessLevel: 'Full'
      }]->(a)
    `, { accounts: batch });
  }
}

async function loadDevicesInBatches(devices) {
  const batchSize = 50;
  console.log(`Loading ${devices.length} devices in batches of ${batchSize}...`);

  for (let i = 0; i < devices.length; i += batchSize) {
    const batch = devices.slice(i, i + batchSize);
    console.log(`Processing device batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(devices.length / batchSize)}...`);

    await executeQuery(`
      UNWIND $devices AS device
      CREATE (d:Device {
        deviceId: device.deviceId,
        type: device.type,
        ipAddress: device.ipAddress,
        userAgent: device.userAgent,
        operatingSystem: device.operatingSystem,
        browser: device.browser,
        lastSeen: datetime(device.lastSeen),
        isTrusted: device.isTrusted,
        deviceFingerprint: device.deviceFingerprint,
        screenResolution: device.screenResolution,
        cookiesEnabled: device.cookiesEnabled,
        language: device.language,
        timezone: device.timezone,
        riskScore: device.riskScore
      })
    `, { devices: batch });
  }
}

async function loadLocationsInBatches(locations) {
  const batchSize = 50;
  console.log(`Loading ${locations.length} locations in batches of ${batchSize}...`);

  for (let i = 0; i < locations.length; i += batchSize) {
    const batch = locations.slice(i, i + batchSize);
    console.log(`Processing location batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(locations.length / batchSize)}...`);

    await executeQuery(`
      UNWIND $locations AS location
      CREATE (l:Location {
        locationId: location.locationId,
        country: location.country,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        riskLevel: location.riskLevel,
        postalCode: location.postalCode,
        isKnownFraudHotspot: location.isKnownFraudHotspot,
        timezone: location.timezone,
        isp: location.isp,
        areaCode: location.areaCode,
        regionName: location.regionName,
        reputationScore: location.reputationScore
      })
    `, { locations: batch });
  }
}

async function loadTransactionsInBatches(transactions) {
  const batchSize = 25;
  console.log(`Loading ${transactions.length} transactions in batches of ${batchSize}...`);

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    console.log(`Processing transaction batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(transactions.length / batchSize)}...`);

    await executeQuery(`
      UNWIND $transactions AS tx
      CREATE (t:Transaction {
        transactionId: tx.transactionId,
        amount: tx.amount,
        date: datetime(tx.date),
        status: tx.status,
        type: tx.type,
        description: tx.description,
        currency: tx.currency,
        riskScore: tx.riskScore,
        isInternational: tx.isInternational,
        fee: tx.fee,
        exchangeRate: tx.exchangeRate,
        category: tx.category,
        referenceNumber: tx.referenceNumber
      })
    `, { transactions: batch });

    await executeQuery(`
      UNWIND $transactions AS tx
      MATCH (t:Transaction {transactionId: tx.transactionId})
      MATCH (from:Account {accountId: tx.fromAccountId})
      CREATE (t)-[:FROM {
        timestamp: datetime(tx.date),
        confirmedBy: 'System',
        isValid: true
      }]->(from)
    `, { transactions: batch });

    await executeQuery(`
      UNWIND $transactions AS tx
      MATCH (t:Transaction {transactionId: tx.transactionId})
      MATCH (to:Account {accountId: tx.toAccountId})
      CREATE (t)-[:TO {
        timestamp: datetime(tx.date),
        confirmedBy: 'System',
        isValid: true
      }]->(to)
    `, { transactions: batch });

    await executeQuery(`
      UNWIND $transactions AS tx
      MATCH (t:Transaction {transactionId: tx.transactionId})
      MATCH (device:Device {deviceId: tx.deviceId})
      CREATE (t)-[:MADE_FROM {
        isVerified: true,
        sessionId: 'SESSION-' + tx.transactionId,
        trustScore: 1.0 - tx.riskScore
      }]->(device)
    `, { transactions: batch });

    await executeQuery(`
      UNWIND $transactions AS tx
      MATCH (t:Transaction {transactionId: tx.transactionId})
      MATCH (location:Location {locationId: tx.locationId})
      CREATE (t)-[:OCCURRED_AT {
        accuracyScore: 0.9,
        verificationMethod: CASE WHEN tx.riskScore > 0.7 THEN 'IP' ELSE 'GPS' END,
        isConsistentWithHistory: tx.riskScore < 0.6
      }]->(location)
    `, { transactions: batch });
  }
}

async function ensureGraphIsConnected() {
  console.log('Ensuring graph is connected...');

  await executeQuery(`
    MERGE (hub:Hub {name: 'ConnectionHub'})
    RETURN hub
  `);

  const disconnectedResult = await executeQuery(`
    MATCH (n)
    WHERE NOT (n)--()
    RETURN id(n) as nodeId
    LIMIT 50
  `);

  const disconnectedIds = disconnectedResult.records.map(record => record.get('nodeId'));

  console.log(`Found ${disconnectedIds.length} disconnected nodes`);

  const batchSize = 10;
  for (let i = 0; i < disconnectedIds.length; i += batchSize) {
    const batch = disconnectedIds.slice(i, i + batchSize);

    for (const nodeId of batch) {
      await executeQuery(`
        MATCH (a), (hub:Hub {name: 'ConnectionHub'})
        WHERE id(a) = $nodeId
        CREATE (a)-[:CONNECTED_TO {
          reason: 'Graph connectivity', 
          createDate: datetime()
        }]->(hub)
      `, { nodeId });
    }
  }

  await executeQuery(`
    MATCH (a:Client)
    MATCH (b:Client)
    WHERE id(a) < id(b)
    WITH a, b, rand() as r
    ORDER BY r
    LIMIT 20
    CREATE (a)-[:KNOWS {
      since: datetime(),
      strength: rand()
    }]->(b)
  `);
}

async function loadFraudPatternsInBatches(fraudPatterns) {
  const batchSize = 10;
  console.log(`Loading ${fraudPatterns.length} fraud patterns in batches of ${batchSize}...`);

  for (let i = 0; i < fraudPatterns.length; i += batchSize) {
    const batch = fraudPatterns.slice(i, i + batchSize);
    console.log(`Processing fraud pattern batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(fraudPatterns.length / batchSize)}...`);

    await executeQuery(`
      UNWIND $patterns AS pattern
      CREATE (fp:FraudPattern {
        type: pattern.type,
        detectedAt: datetime(),
        accounts: pattern.accounts,
        transactions: pattern.transactions,
        device: pattern.device,
        timeSpan: pattern.timeSpan,
        confidence: 0.85,
        status: 'Detected',
        notes: 'Automatically detected by system'
      })
    `, { patterns: batch });
  }

  const circularPatterns = fraudPatterns.filter(p => p.type === 'CircularTransaction');

  for (const pattern of circularPatterns) {
    for (const txId of pattern.transactions) {
      await executeQuery(`
        MATCH (fp:FraudPattern {type: 'CircularTransaction'})
        WHERE $txId IN fp.transactions
        MATCH (t:Transaction {transactionId: $txId})
        CREATE (fp)-[:INCLUDES {weight: 1.0}]->(t)
      `, { txId });
    }
  }
}

async function generateAndLoadData(shouldClear = false, nodeCount = 5000) {
  try {
    const verifySession = driver.session();
    try {
      await verifySession.run('RETURN 1');
      console.log('Connected to Neo4j database');
    } finally {
      await verifySession.close();
    }

    if (shouldClear) {
      await clearDatabase();
      console.log('Database cleared successfully');
      return;
    }

    nodeCount = 5000;
    console.log(`Generating data for approximately ${nodeCount} nodes...`);

    // Distribución de nodos:
    // - 8% clientes
    // - 22% cuentas (aproximadamente 3 por cliente)
    // - 15% dispositivos
    // - 10% ubicaciones
    // - 45% transacciones

    const clientCount = Math.floor(nodeCount * 0.08);
    const deviceCount = Math.floor(nodeCount * 0.15);
    const locationCount = Math.floor(nodeCount * 0.10);

    console.log(`Generating ${clientCount} clients...`);
    const clients = generateClientData(clientCount);

    console.log('Generating accounts...');
    const accounts = generateAccountData(clients);
    console.log(`Generated ${accounts.length} accounts`);

    console.log(`Generating ${deviceCount} devices...`);
    const devices = generateDeviceData(deviceCount);

    console.log(`Generating ${locationCount} locations...`);
    const locations = generateLocationData(locationCount);

    const remainingNodes = nodeCount - clientCount - accounts.length - deviceCount - locationCount;
    const transactionCount = Math.max(remainingNodes, 0);
    console.log(`Generating ${transactionCount} regular transactions...`);
    const transactions = generateTransactionData(accounts, devices, locations, transactionCount);

    console.log('Generating fraud patterns...');
    const { fraudTransactions, fraudPatterns } = generateFraudPatterns(accounts, devices, locations);

    const allTransactions = [...transactions, ...fraudTransactions];

    await loadClientsInBatches(clients);
    await loadAccountsInBatches(accounts);
    await loadDevicesInBatches(devices);
    await loadLocationsInBatches(locations);
    await loadTransactionsInBatches(allTransactions);
    await loadFraudPatternsInBatches(fraudPatterns);

    await ensureGraphIsConnected();

    const countSession = driver.session();
    try {
      const result = await countSession.run('MATCH (n) RETURN count(n) as nodeCount');
      const nodeCount = result.records[0].get('nodeCount');
      console.log(`Total nodes in database: ${nodeCount}`);

      if (nodeCount < 5000) {
        console.warn(`Warning: Node count (${nodeCount}) is less than the required 5000.`);
      } else {
        console.log(`Successfully generated ${nodeCount} nodes.`);
      }
    } finally {
      await countSession.close();
    }

    console.log('Data generation and loading completed successfully');
  } catch (error) {
    console.error('Error generating and loading data:', error);
  } finally {
    await driver.close();
  }
}

const shouldClear = process.argv.includes('--clear');
const nodeCount = 5000;

generateAndLoadData(shouldClear, nodeCount).then(() => {
  console.log('Script execution completed');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error executing script:', error);
  process.exit(1);
});