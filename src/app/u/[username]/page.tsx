'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { useCompletion } from 'ai/react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';
import DarkModeToggle from '@/components/DarkButton';

const specialChar = '||';
const parseMessages = (messages: any[]): string[] => {
  return messages.map(msg => typeof msg === "string" ? msg : msg.text || "");
};

const initialMessageString = "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const { complete, completion, isLoading: isSuggestLoading, error } = useCompletion({
    api: '/api/suggest-messages',
    initialCompletion: initialMessageString,
  });
  const form = useForm<z.infer<typeof messageSchema>>({ resolver: zodResolver(messageSchema) });
  const messageContent = form.watch('content');
  const [isLoading, setIsLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
    // Add subtle animation to textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.classList.add('scale-102');
      setTimeout(() => textarea.classList.remove('scale-102'), 300);
    }
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', { ...data, username });
      toast({
        title: response.data.message,
        variant: 'default',
        className: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800'
      });
      form.reset({ ...form.getValues(), content: '' });
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 3000);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className="container mx-auto my-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-4xl transition-all duration-300 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 animate-fadeIn">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Public Profile Link
          </span>
        </h1>
        <DarkModeToggle />
      </div>



      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-3">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Send Anonymous Message to
                      <span className="font-bold text-blue-600 dark:text-blue-400">@{username}</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your anonymous message here..."
                        className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all dark:bg-gray-800 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 min-h-32 text-lg shadow-inner rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm font-medium text-red-500 dark:text-red-400" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !messageContent}
                className={`px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-300 hover:shadow-blue-200 dark:hover:shadow-blue-900 ${messageSent ? 'animate-success' : 'hover:scale-105'}`}
              >
                <Send className="mr-2 h-5 w-5" /> Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-10">
        <div className="flex justify-center">
          <Button
            onClick={() => complete('')}
            className="my-4 transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-6 py-2 hover:scale-105 shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900 flex items-center"
            disabled={isSuggestLoading}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {isSuggestLoading ? "Generating..." : "Suggest Messages"}
          </Button>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-center italic font-light">Click on any message below to select it</p>

        <Card className="shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Suggested Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4 p-6">
            {error ? (
              <p className="text-red-500 text-center py-4">{error.message}</p>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 transition-all">
                {parseMessages(completion.split(specialChar)).map((message, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="mb-2 p-4 text-left hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-300 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 group hover:scale-102 shadow-sm hover:shadow-md"
                    onClick={() => handleMessageClick(message)}
                  >
                    <span className="truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">{message}</span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent h-px" />

      <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300">
        <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">Want to receive anonymous messages too?</p>
        <Link href={'/sign-up'}>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-6 py-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900">
            Create Your Account
          </Button>
        </Link>
      </div>
    </div>
  );
}

