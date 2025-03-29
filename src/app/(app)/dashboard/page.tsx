'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { ClipboardCopy, Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { motion } from 'framer-motion';
import DarkModeToggle from '@/components/DarkButton'; // Ensure the correct import

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const { toast } = useToast();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages');
      setMessages(response.data.messages || []);
      if (refresh) {
        toast({
          title: 'Refreshed Messages',
          description: 'Showing latest messages',
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [setMessages, toast]);

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: response.data.message,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to update message settings',
        variant: 'destructive',
      });
    }
  };

  if (!session || !session.user) return <div></div>;

  const { username } = session.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-4 sm:my-8 mx-2 sm:mx-4 md:mx-8 lg:mx-auto p-4 sm:p-6 md:p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-6xl"
    >
      {/* Title & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"
        >
          User Dashboard
        </motion.h1>
        <div className="self-end sm:self-auto">
          <DarkModeToggle />
        </div>
      </div>

      {/* Profile Link */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-200">
          Your Unique Link
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={copyToClipboard}
            className={`px-4 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 font-medium w-full sm:w-auto mt-2 sm:mt-0 ${
              copySuccess ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white`}
          >
            <ClipboardCopy className="h-4 w-4" />
            {copySuccess ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Accept Messages Switch */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
        <Switch {...register('acceptMessages')} checked={acceptMessages} onCheckedChange={handleSwitchChange} />
        <div className="flex flex-col">
          <span className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200">
            Accept Messages: {acceptMessages ? 'On' : 'Off'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {acceptMessages ? 'People can send you messages' : 'Message receiving is disabled'}
          </span>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => fetchMessages(true)} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
          className="flex items-center gap-2 text-xs sm:text-sm"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
          Refresh
        </Button>
      </div>

      <Separator className="my-4 sm:my-6" />

      {/* Messages Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard key={message._id} message={message} onMessageDelete={handleDeleteMessage} />
          ))
        ) : (
          <div className="col-span-1 lg:col-span-2 p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default UserDashboard;