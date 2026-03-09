import { useState, useCallback, useRef } from 'react';

export function useAuroraDockUI() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDockVisible, setIsDockVisible] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [scrollToMessageId, setScrollToMessageId] = useState<string | null>(null);
  const [pendingProactiveMessage, setPendingProactiveMessage] = useState<string | null>(null);
  const [pendingAssistantGreeting, setPendingAssistantGreeting] = useState<string | null>(null);
  const [assessmentDomainId, setAssessmentDomainId] = useState<string | null>(null);
  const [pillarActionLabel, setPillarActionLabel] = useState<string | null>(null);
  const [pillarActionLoading, setPillarActionLoading] = useState(false);
  const [pillarActionCallback, setPillarActionCallbackState] = useState<(() => void) | null>(null);

  const sendMessageRef = useRef<((message: string, imageBase64?: string) => void) | null>(null);

  const toggleChatExpanded = useCallback(() => {
    setIsChatExpanded(prev => !prev);
  }, []);

  const registerSendMessage = useCallback((fn: (message: string, imageBase64?: string) => void) => {
    sendMessageRef.current = fn;
  }, []);

  const openChatAndScrollToMessage = useCallback((conversationId: string, messageId: string, setCurrentConversationId: (id: string) => void) => {
    setCurrentConversationId(conversationId);
    setScrollToMessageId(messageId);
    setIsDockVisible(true);
    setIsChatExpanded(true);
  }, []);

  const startAssessment = useCallback((domainId: string) => {
    setAssessmentDomainId(domainId);
    setIsDockVisible(true);
    setIsChatExpanded(true);
  }, []);

  const endAssessment = useCallback(() => {
    setAssessmentDomainId(null);
  }, []);

  const setPillarAction = useCallback((label: string | null, callback: (() => void) | null) => {
    setPillarActionLabel(label);
    setPillarActionCallbackState(() => callback);
  }, []);

  return {
    isStreaming,
    setIsStreaming,
    isDockVisible,
    setIsDockVisible,
    isChatExpanded,
    setIsChatExpanded,
    toggleChatExpanded,
    scrollToMessageId,
    setScrollToMessageId,
    pendingProactiveMessage,
    setPendingProactiveMessage,
    pendingAssistantGreeting,
    setPendingAssistantGreeting,
    assessmentDomainId,
    startAssessment,
    endAssessment,
    sendMessageRef,
    registerSendMessage,
    openChatAndScrollToMessage,
    pillarActionCallback,
    pillarActionLabel,
    pillarActionLoading,
    setPillarAction,
    setPillarActionLoading,
  };
}
