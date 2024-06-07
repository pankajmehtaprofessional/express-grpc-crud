import grpc from 'grpc';
import protoLoader from '@grpc/proto-loader';
import mongoose from 'mongoose';
import User from './models/user.js';
import path from "path";
import { fileURLToPath } from 'url';

mongoose.connect('mongodb://localhost:27017/users');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = [path.resolve(__dirname, '../proto/user.proto')];
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const server = new grpc.Server();

server.addService(userProto.UserService.service, {
  GetUser: async (call, callback) => {
    try {
        const user = await User.findOne({ _id: call.request.id});
      if (user) {
        callback(null, { id: user._id.toString(), name: user.name, email: user.email });
      } else {
        callback({ code: grpc.status.NOT_FOUND, details: 'User not found' });
      }
    } catch (error) {
      callback(error);
    }
  },
  AddUser: async (call, callback) => {
    try {
        const user = await User.create({ ...call.request });
      if (user) {
        callback(null, { _id: user._id.toString(), name: user.name, email: user.email });
      } else {
        callback({ code: grpc.status.NOT_FOUND, details: 'User not found' });
      }
    } catch (error) {
      callback(error);
    }
  },
  ListUser: async (call, callback) => {
    try {
        const user = await User.find({});
      if (user) {
        callback(null, {users: user});
      } else {
        callback({ code: grpc.status.NOT_FOUND, details: 'User not found' });
      }
    } catch (error) {
      console.log(error, '--------------errr-------------')
      callback(error);
    }
  },
});

const PORT = 50051;
server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
console.log(`gRPC server running at http://127.0.0.1:${PORT}`);
server.start();
